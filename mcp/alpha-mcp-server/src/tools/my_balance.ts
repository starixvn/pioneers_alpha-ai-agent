import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getRoleName, formatDecimal } from "../helpers";
import { getBalance } from "../api/alpha_api";
import { BalanceInfoResponse, OutStanding } from "../api/alpha_api.types";

function getOutstanding(outstanding: OutStanding, roleId: number) {
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
}

function formatBalance(data: BalanceInfoResponse, roleId: number) {
  return [
    `Currency: ${data.currencyName}`,
    `Cash: ${formatDecimal(data.cashBalance)}`,
    `Yesterday Cash: ${formatDecimal(data.yesterdayCashBalance)}`,
    `Balance: ${formatDecimal(data.totalBalance)}`,
    `Yesterday Balance: ${formatDecimal(data.yesterdayTotalBalance)}`,
    `Today Win Loss: ${formatDecimal(data.todayWinLoss)}`,
    `Yesterday Win Loss: ${formatDecimal(data.yesterdayWinLoss)}`,
    `3rd Party Pending Transfer: ${formatDecimal(data.pendingTransfer3rd)}`,
    `Given Credit: ${formatDecimal(data.givenCredit)}`,
    `${getRoleName(roleId - 1)} Credit: ${formatDecimal(data.memberCredit)}`,
    `Member Outstanding: ${formatDecimal(data.outstanding.memberOutstanding)}`,
    `${getRoleName(roleId)} Outstanding: ${formatDecimal(
      getOutstanding(data.outstanding, roleId)
    )}`,
    `Reward Receivable: ${data.rewardCurrency} ${formatDecimal(
      data.rewardReceivable
    )}`,
    `Reward Payable: ${data.rewardCurrency} ${formatDecimal(
      data.rewardPayable
    )}`,
  ].join("\n");
}

export default function registerMyBalanceTool(server: McpServer) {
  server.tool(
    "my-balance",
    "[My Balance Lookup] Retrieve detailed balance and credit information for the current customer and role. Use this tool when the user asks for their own balance, credit, or financial details. Input required: Customer ID and Role ID (2=Agent, 3=Master, 4=Super).",
    {
      custId: z.number().min(1).describe("Customer ID"),
      roleId: z
        .number()
        .min(2)
        .max(4)
        .describe(
          "Customer Role ID (e.g., 4 = Super, 3 = Master, 2 = Agent)"
        ),
    },
    async ({ custId, roleId }) => {
      const balance = await getBalance(custId, roleId);
      const balanceText = balance
        ? `Your Balance:\n${formatBalance(balance, roleId)}`
        : "No information is available.";

      return {
        content: [
          {
            type: "text",
            text: balanceText,
          },
        ],
      };
    }
  );
}
