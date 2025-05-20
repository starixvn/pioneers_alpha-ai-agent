import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatDecimal } from "../helpers";
import { getDownlineBalance } from "../api/alpha_api";
import { DownlineBalanceResponse } from "../api/alpha_api.types";

function formatMasterBalance(data: DownlineBalanceResponse) {
  return [
    `Cash: ${formatDecimal(data.totalCash)}`,
    `Yesterday Cash: ${formatDecimal(data.yesterdayCash)}`,
    `Balance: ${formatDecimal(data.totalBalance)}`,
    `Yesterday Balance: ${formatDecimal(data.yesterdayBalance)}`,
    `Master Outstanding: ${formatDecimal(data.outstanding.masterOutstanding)}`,
    `3rd Party Pending Transfer: ${formatDecimal(data.pendingTransfer3rd)}`,
    `Used Credit: ${formatDecimal(data.usedCredit)}`,
    `Given Credit: ${formatDecimal(data.givenCredit)}`,
    `Member Outstanding: ${formatDecimal(data.outstanding.memberOutstanding)}`,
    `Super Outstanding: ${formatDecimal(data.outstanding.superOutstanding)}`,
    `Reward Receivable: ${data.rewardCurrency} ${formatDecimal(
      data.rewardReceivable
    )}`,
    `Reward Payable: ${data.rewardCurrency} ${formatDecimal(
      data.rewardPayable
    )}`,
  ].join("\n");
}

function formatAgentBalance(data: DownlineBalanceResponse) {
  return [
    `Cash: ${formatDecimal(data.totalCash)}`,
    `Yesterday Cash: ${formatDecimal(data.yesterdayCash)}`,
    `Balance: ${formatDecimal(data.totalBalance)}`,
    `Yesterday Balance: ${formatDecimal(data.yesterdayBalance)}`,
    `Agent Outstanding: ${formatDecimal(data.outstanding.agentOutstanding)}`,
    `3rd Party Pending Transfer: ${formatDecimal(data.pendingTransfer3rd)}`,
    `Used Credit: ${formatDecimal(data.usedCredit)}`,
    `Given Credit: ${formatDecimal(data.givenCredit)}`,
    `Member Max Credit: ${formatDecimal(data.memberMaxCredit)}`,
    `Member Outstanding: ${formatDecimal(data.outstanding.memberOutstanding)}`,
    `Master Outstanding: ${formatDecimal(data.outstanding.masterOutstanding)}`,
    `Reward Receivable: ${data.rewardCurrency} ${formatDecimal(
      data.rewardReceivable
    )}`,
    `Reward Payable: ${data.rewardCurrency} ${formatDecimal(
      data.rewardPayable
    )}`,
  ].join("\n");
}

function formatMemberBalance(data: DownlineBalanceResponse) {
  return [
    `Balance: ${formatDecimal(data.totalBalance)}`,
    `Yesterday Balance: ${formatDecimal(data.yesterdayBalance)}`,
    `3rd Party Pending Transfer: ${formatDecimal(data.pendingTransfer3rd)}`,
    `Given Credit: ${formatDecimal(data.givenCredit)}`,
    `Net Position: ${formatDecimal(data.netPosition)}`,
    `Bet Credit: ${formatDecimal(data.betCredit)}`,
    `Member Outstanding: ${formatDecimal(data.outstanding.memberOutstanding)}`,
    `Agent Outstanding: ${formatDecimal(data.outstanding.agentOutstanding)}`,
    `Reward Receivable: ${data.rewardCurrency} ${formatDecimal(
      data.rewardReceivable
    )}`,
  ].join("\n");
}

export default function registerDownlineBalanceTool(server: McpServer) {
  server.tool(
    "balance-by-username",
    "Retrieves detailed balance information for a specific down line by username of a customer and role",
    {
      custId: z.number().min(1).describe("Customer ID"),
      roleId: z
        .number()
        .min(2)
        .max(4)
        .describe(
          "Customer Role ID (e.g., 4 for Super, 3 for Master, 2 for Agent)"
        ),
      username: z.string().describe("Username of downline"),
    },
    async ({ custId, roleId, username }) => {
      let balanceText: string;
      const balance = await getDownlineBalance(custId, roleId, username);

      if (balance) {
        const formattedBalance =
          balance.roleId === 3
            ? formatMasterBalance(balance)
            : roleId === 2
            ? formatAgentBalance(balance)
            : formatMemberBalance(balance);
        balanceText = `Balance of ${username}:\n${formattedBalance}`;
      } else {
        balanceText = "No information is available.";
      }

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
