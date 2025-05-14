import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import registerGetBalanceInfoTool from "./get-balance-info";
import registerGetTopBalanceTool from "./get-top-balance";
import registerGetWinLossTool from "./get-win-loss";

const NWS_API_BASE = "https://alpha-api.nexdev.net/api";

export default function registerTools(server: McpServer) {
  registerGetBalanceInfoTool(server, NWS_API_BASE);
  registerGetTopBalanceTool(server, NWS_API_BASE);
  registerGetWinLossTool(server, NWS_API_BASE);
}
