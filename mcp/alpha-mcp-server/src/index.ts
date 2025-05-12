import express from "express";
import { z } from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import { BalanceInfoResponse, formatBalanceInfo } from "./balance-info";
import { makeNWSRequest } from "./helpers";
import { formatWinLoss, WinLossResponse } from "./win-loss";

const PORT = process.env.PORT ?? 5000;
const app = express();

const NWS_API_BASE = "https://alpha-api.nexdev.net/api";

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
      "get-win-loss": {
        description:
          "Retrieves detailed win/loss information for a specific customer and role in a specific date.",
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
            date: {
              type: "string",
              description: "Date in format YYYY-MM-DD",
            },
          },
          required: ["custId", "roleId", "date"],
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

server.tool(
  "get-win-loss",
  "Retrieves detailed win/loss information for a specific customer and role in a specific date.",
  {
    custId: z.number().min(1).describe("Customer ID"),
    roleId: z.number().min(1).max(4).describe("Customer Role ID"),
    date: z.string().describe("Date in format YYYY-MM-DD"),
  },
  async ({ custId, roleId, date }) => {
    const url = `${NWS_API_BASE}/WinLoss/GetWinLoss?custId=${custId}&custLevelId=${roleId}&date=${date}`;
    const data = await makeNWSRequest<WinLossResponse>(url);

    if (!data) {
      return {
        content: [{ type: "text", text: "Failed to retrieve win/loss info" }],
      };
    }
    const formattedWinLoss = formatWinLoss(data, roleId);
    const winLossText = `Your Win/Loss info:\n\n${formattedWinLoss}`;
    return {
      content: [
        {
          type: "text",
          text: winLossText,
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
