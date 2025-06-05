import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import registerTools from "./tools/index";

const PORT = process.env.PORT ?? 5000;
const app = express();
let transport: SSEServerTransport | null = null;

// Create server instance with explicit tool registration
const server = new McpServer({
  name: "alpha-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register the tool handler
registerTools(server);

// Express routes
app.get("/sse", (_, res) => {
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

app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
