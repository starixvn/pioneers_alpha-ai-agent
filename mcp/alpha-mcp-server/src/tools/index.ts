import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import registerMyBalanceTool from "./my_balance";
import registerTopBalanceTool from "./top_balance";
import registerDownlineBalanceTool from "./downline_balance";
import registerWinLossTool from "./winloss";
import registerTopOutstandingTool from "./top_outstanding";
import registerDownlineOutstandingTool from "./downline_outstanding";
import registerDomainTool from "./domain";

export default function registerTools(server: McpServer) {
  registerMyBalanceTool(server);
  registerTopBalanceTool(server);
  registerDownlineBalanceTool(server);
  registerWinLossTool(server);
  registerTopOutstandingTool(server);
  registerDownlineOutstandingTool(server);
  registerDomainTool(server);
}
