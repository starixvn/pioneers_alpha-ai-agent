import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatDecimal } from "../helpers";
import { getWinLoss } from "../api/alpha_api";
import { WinLossResponse } from "../api/alpha_api.types";

function formatMasterWinLoss(data: WinLossResponse) {
  return [
    `Turnover: ${formatDecimal(data.turnover)}`,
    `Gross Commission: ${formatDecimal(data.grossComm)}`,
    `Down line Total: ${formatDecimal(data.masterTotal)}`,
    `Super Win Loss: ${formatDecimal(data.superWinLoss)}`,
    `Super Commission: ${formatDecimal(data.superComm)}`,
    `Super Total: ${formatDecimal(data.superTotal)}`,
    `Company Win Loss: ${formatDecimal(data.companyWinLoss)}`,
  ].join("\n");
}

function formatAgentWinLoss(data: WinLossResponse) {
  return [
    `Turnover: ${formatDecimal(data.turnover)}`,
    `Gross Commission: ${formatDecimal(data.grossComm)}`,
    `Down line Total: ${formatDecimal(data.agentTotal)}`,
    `Master Win Loss: ${formatDecimal(data.masterWinLoss)}`,
    `Master Commission: ${formatDecimal(data.masterComm)}`,
    `Master Total: ${formatDecimal(data.masterTotal)}`,
    `Company Win Loss: ${formatDecimal(data.companyWinLoss)}`,
  ].join("\n");
}

function formatMemberWinLoss(data: WinLossResponse) {
  return [
    `Turnover: ${formatDecimal(data.turnover)}`,
    `Gross Commission: ${formatDecimal(data.grossComm)}`,
    `Member Win Loss: ${formatDecimal(data.memberWinLoss)}`,
    `Member Commission: ${formatDecimal(data.memberComm)}`,
    `Member Total: ${formatDecimal(data.memberTotal)}`,
    `Agent Win Loss: ${formatDecimal(data.agentWinLoss)}`,
    `Agent Commission: ${formatDecimal(data.agentComm)}`,
    `Agent Total: ${formatDecimal(data.agentTotal)}`,
    `Company Win Loss: ${formatDecimal(data.companyWinLoss)}`,
  ].join("\n");
}

function formatMemberDownlineWinLoss(data: WinLossResponse) {
  return [
    `Member Win Loss: ${formatDecimal(data.memberWinLoss)}`,
    `Member Commission: ${formatDecimal(data.memberComm)}`,
    `Member Total: ${formatDecimal(data.memberTotal)}`,
  ].join("\n");
}

function formatWinLoss(data: WinLossResponse, roleId: number) {
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
}

export default function registerWinLossTool(server: McpServer) {
  server.tool(
    "winloss-report",
    "[Win Loss Report] Retrieve detailed win loss, turnover, and commission information for a specific customer and role within a date range and filter by product group. Use this tool when the user asks for win loss, turnover, commission, or report details for themselves or their down line. Input required: Customer ID, Role ID (1=Member, 2=Agent, 3=Master, 4=Super), From Date, To Date, and Product Group (e.g., All, Sportsbook, Casino).",
    {
      custId: z.number().min(1).describe("Customer ID"),
      roleId: z
        .number()
        .min(1)
        .max(4)
        .describe(
          "Customer Role ID (e.g., 4 for Super, 3 for Master, 2 for Agent)"
        ),
      fromDate: z.string().describe("From date format in YYYY-MM-DD"),
      toDate: z.string().describe("To date format in YYYY-MM-DD"),
      groupProduct: z
        .string()
        .default("All")
        .optional()
        .describe(
          "Group of product to filter (e.g., All for getting all products, Sportsbook for getting Sportsbook only, Casino for getting others products)"
        ),
    },
    async ({ custId, roleId, fromDate, toDate, groupProduct = "All" }) => {
      const winloss = await getWinLoss(
        custId,
        roleId,
        fromDate,
        toDate,
        groupProduct
      );
      const winlossText = winloss
        ? `Your Win/Loss ${
            fromDate === toDate ? fromDate : `${fromDate} - ${toDate}`
          }:\n${formatWinLoss(winloss, roleId)}`
        : "No information is available.";

      return {
        content: [
          {
            type: "text",
            text: winlossText,
          },
        ],
      };
    }
  );
}
