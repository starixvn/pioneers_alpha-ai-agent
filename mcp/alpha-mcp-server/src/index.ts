import express from 'express';
import { z } from 'zod';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

import { makeNWSRequest } from './helpers';

const PORT = process.env.PORT ?? 5000;
const app = express();

const NWS_API_BASE = "https://alpha-api.nexdev.net/api";

// Define interfaces
interface OutStanding {
  superOutstanding: number;
  masterOutstanding: number;
  agentOutstanding: number;
  memberOutstanding: number;
}

interface BalanceInfoResponse {
  currencyName: string;
  cashBalance: number;
  yesterdayCashBalance: number;
  totalBalance: number;
  yesterdayTotalBalance: number;
  todayWinLoss: number;
  yesterdayWinLoss: number;
  givenCredit: number;
  memberCredit: number;
  pendingTransfer3rd: number;
  outstanding: OutStanding;
  rewardReceivable: number;
  rewardPayable: number;
  rewardCurrency: string;
  directMemberCredit: string;
}

// Helper functions
const getRoleName = (roleId: number) => {
  switch (roleId) {
    case 4:
      return "Super";
    case 3:
      return "Master";
    case 2:
      return "Agent";
    case 1:
      return "Member";
    default:
      return "Unknown";
  }
};

const getOutstanding = (outstanding: OutStanding, roleId: number) => {
  switch (roleId) {
    case 4:
      return outstanding.superOutstanding;
    case 3:
      return outstanding.masterOutstanding;
    case 2:
      return outstanding.agentOutstanding;
    case 1:
      return outstanding.memberOutstanding;
    default:
      return 0;
  }
};

const formatBalanceInfo = (data: BalanceInfoResponse, roleId: number) => {
  return [
    `Currency: ${data.currencyName || "Unknown"}`,
    `Cash: ${data.cashBalance.toFixed(2) || "Unknown"}`,
    `Yesterday Cash: ${data.yesterdayCashBalance.toFixed(2) || "Unknown"}`,
    `Balance: ${data.totalBalance.toFixed(2) || "Unknown"}`,
    `Yesterday Balance: ${data.yesterdayTotalBalance.toFixed(2) || "Unknown"}`,
    `Today Win/Loss: ${data.todayWinLoss.toFixed(2) || "Unknown"}`,
    `Yesterday Win/Loss: ${data.yesterdayWinLoss.toFixed(2) || "Unknown"}`,
    `3rd Party Pending Transfer: ${
      data.pendingTransfer3rd.toFixed(2) || "Unknown"
    }`,
    `Given Credit: ${data.givenCredit || "Unknown"}`,
    `${getRoleName(roleId - 1)} Credit: ${data.memberCredit || "Unknown"}`,
    `Member Outstanding: ${data.outstanding.memberOutstanding || "Unknown"}`,
    `${getRoleName(roleId)} Outstanding: ${
      getOutstanding(data.outstanding, roleId)?.toFixed(2) ?? "Unknown"
    }`,
    `Reward Receivable: ${data.rewardCurrency} ${
      data.rewardReceivable.toFixed(2) || "Unknown"
    }`,
    `Reward Payable: ${data.rewardCurrency} ${
      data.rewardPayable.toFixed(2) || "Unknown"
    }`,
    "---",
  ].join("\n");
};

// Create server instance with explicit tool registration
const server = new McpServer({
  name: "alpha-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {
      "get-balance-info": {
        description:
          "Retrieves detailed balance information for a specific customer and role.",
        parameters: {
          type: "object",
          properties: {
            custId: {
              type: "number",
              description: "Customer ID",
              minimum: 1,
            },
            roleId: {
              type: "number",
              description: "Customer Role ID",
              minimum: 1,
              maximum: 4,
            },
          },
          required: ["custId", "roleId"],
        },
      },
    },
  },
});

let transport: SSEServerTransport | null = null;

// Register the tool handler
server.tool(
  "get-balance-info",
  "Retrieves detailed balance information for a specific customer and role.",
  {
    custId: z.number().min(1).describe("Customer ID"),
    roleId: z.number().min(1).max(4).describe("Customer Role ID"),
  },
  async ({ custId, roleId }) => {
    const url = `${NWS_API_BASE}/BalanceInfo/GetCustomerBalance?custId=${custId}&custLevelId=${roleId}`;
    const data = await makeNWSRequest<BalanceInfoResponse>(url);

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve balance info",
          },
        ],
      };
    }

    const formattedBalanceInfo = formatBalanceInfo(data, roleId);
    const balanceInfoText = `Your balance info:\n\n${formattedBalanceInfo}`;

    return {
      content: [
        {
          type: "text",
          text: balanceInfoText,
        },
      ],
    };
  }
);

// Express routes
app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});

app.post("/messages", (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  } else {
    res.status(500).send("Transport not initialized.");
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
