import express from "express";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import registerTools from "./tools";

const PORT = process.env.PORT ?? 5000;
const app = express();

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
      "get-top-balance": {
        description:
          "Retrieves a list of accounts that have highest balance amount for a specific customer and role.",
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
            top: {
              type: "number",
              description: "Number of top accounts to retrieve",
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
          required: ["custId", "roleId"],
        },
      },
      "get-balance-by-username": {
        description:
          "Retrieves detailed balance information for a specific down line by username of a customer and role.",
        parameters: {
          type: "object",
          properties: {
            username: {
              type: "string",
              description: "Username of down line",
              required: true,
              length: {
                min: 1,
                max: 50,
              },
            },
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
          required: ["username", "custId", "roleId"],
        },
      },
      "get-win-loss": {
        description:
          "Retrieves detailed win/loss information for a specific customer and role in a range between from date and to date.",
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
            fromDate: {
              type: "string",
              description: "Date in format YYYY-MM-DD",
            },
            toDate: {
              type: "string",
              description: "Date in format YYYY-MM-DD",
            },
          },
          required: ["custId", "roleId", "fromDate", "toDate"],
        },
      },
    },
  },
});

let transport: SSEServerTransport | null = null;

// Register the tool handler
registerTools(server);

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
  console.log(`Server is running on http://localhost:${PORT}`);
});
