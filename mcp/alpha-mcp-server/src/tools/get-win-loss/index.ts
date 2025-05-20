import { z } from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { makeNWSRequest } from "../../helpers";
import { WinLossResponse } from "./types";

const formatMasterWinLoss = (data: WinLossResponse) => {
  return [
    `Turnover: ${data.turnover}`,
    `Gross Commission: ${data.grossComm}`,
    `Downline Total: ${data.masterTotal}`,
    `Super Win/Loss: ${data.superWinLoss}`,
    `Super Commission: ${data.superComm}`,
    `Super Total: ${data.superTotal}`,
    `Company Win/Loss: ${data.companyWinLoss}`,
    "---",
  ].join("\n");
};

const formatAgentWinLoss = (data: WinLossResponse) => {
  return [
    `Turnover: ${data.turnover}`,
    `Gross Commission: ${data.grossComm}`,
    `Downline Total: ${data.agentTotal}`,
    `Master Win/Loss: ${data.masterWinLoss}`,
    `Master Commission: ${data.masterComm}`,
    `Master Total: ${data.masterTotal}`,
    `Company Win/Loss: ${data.companyWinLoss}`,
    "---",
  ].join("\n");
};

const formatMemberWinLoss = (data: WinLossResponse) => {
  return [
    `Turnover: ${data.turnover}`,
    `Gross Commission: ${data.grossComm}`,
    `Member Win/Loss: ${data.memberWinLoss}`,
    `Member Commission: ${data.memberComm}`,
    `Member Total: ${data.memberTotal}`,
    `Agent Win/Loss: ${data.agentWinLoss}`,
    `Agent Commission: ${data.agentComm}`,
    `Agent Total: ${data.agentTotal}`,
    `Company Win/Loss: ${data.companyWinLoss}`,
    "---",
  ].join("\n");
};

const formatMemberDownlineWinLoss = (data: WinLossResponse) => {
  return [
    `Member Win/Loss: ${data.memberWinLoss}`,
    `Member Commission: ${data.memberComm}`,
    `Member Total: ${data.memberTotal}`,
  ].join("\n");
};

const formatWinLoss = (data: WinLossResponse, roleId: number) => {
  switch (roleId) {
    case 4:
      return formatMasterWinLoss(data);
    case 3:
      return formatAgentWinLoss(data);
    case 2:
      return formatMemberWinLoss(data);
    default:
      return formatMemberDownlineWinLoss(data);
  }
};

export default function registerGetWinLossTool(
  server: McpServer,
  NWS_API_BASE: string
) {
  server.tool(
    "get-win-loss",
    "Retrieves detailed win/loss information for a specific customer and role in a range between from date and to date.",
    {
      custId: z.number().min(1).describe("Customer ID"),
      roleId: z.number().min(1).max(4).describe("Customer Role ID"),
      fromDate: z.string().min(1).describe("Date in YYYY-MM-DD format"),
      toDate: z.string().min(1).describe("Date in YYYY-MM-DD format"),
    },
    async ({ custId, roleId, fromDate, toDate }) => {
      const url = `${NWS_API_BASE}/WinLoss/GetWinLoss2?custId=${custId}&custLevelId=${roleId}&fromDate=${fromDate}&toDate=${toDate}`;
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
}
