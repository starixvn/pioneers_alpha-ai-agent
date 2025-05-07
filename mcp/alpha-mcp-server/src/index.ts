import express from 'express';
import { z } from 'zod';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

import { makeNWSRequest } from './helpers';

const app = express();

const NWS_API_BASE = "https://alpha-api.nexdev.net/api";

// Create server instance
const server = new McpServer({
  name: "alpha-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

let transport: SSEServerTransport | null = null;

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
    `Yesterday Win/Loss: ${data.yesterdayWinLoss || "Unknown"}`,
    `3rd Party Pending Transfer: ${
      data.pendingTransfer3rd.toFixed(2) || "Unknown"
    }`,
    `Given Credit: ${data.givenCredit || "Unknown"}`,
    `${getRoleName(roleId - 1)} Credit: ${data.memberCredit || "Unknown"}`,
    `Member Outstanding: ${data.outstanding.memberOutstanding || "Unknown"}`,
    `${getRoleName(roleId)} OutStanding: ${
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

server.tool(
  "get-balance-info",
  "request to  retrieve the balance details for a specific customer and role",
  {
    custId: z.number().min(1).describe("customer id"),
    roleId: z.number().min(1).max(4).describe("customer role id"),
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

app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});

app.post("/messages", (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
