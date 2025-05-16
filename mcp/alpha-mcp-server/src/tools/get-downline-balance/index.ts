import { z } from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { makeNWSRequest } from "../../helpers";
import { DownlineBalanceResponse, DownlineInfoResponse } from "./types";

const formatMasterBalance = (data: DownlineBalanceResponse) => {
  return [
    `Cash: ${data.totalCash.toFixed(2) || "Unknown"}`,
    `Yesterday Cash: ${data.yesterdayCash.toFixed(2) || "Unknown"}`,
    `Balance: ${data.totalBalance.toFixed(2) || "Unknown"}`,
    `Yesterday Balance: ${data.yesterdayBalance.toFixed(2) || "Unknown"}`,
    `Master Outstanding: ${
      data.outstanding.masterOutstanding.toFixed(2) || "Unknown"
    }`,
    `3rd Party Pending Transfer: ${
      data.pendingTransfer3rd.toFixed(2) || "Unknown"
    }`,
    `Used Credit: ${data.usedCredit.toFixed(2) || "Unknown"}`,
    `Given Credit: ${data.givenCredit.toFixed(2) || "Unknown"}`,
    `Member Outstanding: ${
      data.outstanding.memberOutstanding.toFixed(2) || "Unknown"
    }`,
    `Super Outstanding: ${
      data.outstanding.superOutstanding.toFixed(2) ?? "Unknown"
    }`,
    `Reward Receivable: ${data.rewardCurrency} ${
      data.rewardReceivable.toFixed(2) || "Unknown"
    }`,
    `Reward Payable: ${data.rewardCurrency} ${
      data.rewardPayable.toFixed(2) || "Unknown"
    }`,
  ].join("\n");
};

const formatAgentBalance = (data: DownlineBalanceResponse) => {
  return [
    `Cash: ${data.totalCash.toFixed(2) || "Unknown"}`,
    `Yesterday Cash: ${data.yesterdayCash.toFixed(2) || "Unknown"}`,
    `Balance: ${data.totalBalance.toFixed(2) || "Unknown"}`,
    `Yesterday Balance: ${data.yesterdayBalance.toFixed(2) || "Unknown"}`,
    `Agent Outstanding: ${
      data.outstanding.agentOutstanding.toFixed(2) || "Unknown"
    }`,
    `3rd Party Pending Transfer: ${
      data.pendingTransfer3rd.toFixed(2) || "Unknown"
    }`,
    `Used Credit: ${data.usedCredit.toFixed(2) || "Unknown"}`,
    `Given Credit: ${data.givenCredit.toFixed(2) || "Unknown"}`,
    `Member Max Credit: ${data.memberMaxCredit.toFixed(2) || "Unknown"}`,
    `Member Outstanding: ${
      data.outstanding.memberOutstanding.toFixed(2) || "Unknown"
    }`,
    `Master Outstanding: ${
      data.outstanding.masterOutstanding.toFixed(2) ?? "Unknown"
    }`,
    `Reward Receivable: ${data.rewardCurrency} ${
      data.rewardReceivable.toFixed(2) || "Unknown"
    }`,
    `Reward Payable: ${data.rewardCurrency} ${
      data.rewardPayable.toFixed(2) || "Unknown"
    }`,
  ].join("\n");
};

const formatMemberBalance = (data: DownlineBalanceResponse) => {
  return [
    `Balance: ${data.totalBalance.toFixed(2) || "Unknown"}`,
    `Yesterday Balance: ${data.yesterdayBalance.toFixed(2) || "Unknown"}`,
    `3rd Party Pending Transfer: ${
      data.pendingTransfer3rd.toFixed(2) || "Unknown"
    }`,
    `Given Credit: ${data.givenCredit.toFixed(2) || "Unknown"}`,
    `Net Position: ${data.netPosition.toFixed(2) || "Unknown"}`,
    `Bet Credit: ${data.betCredit.toFixed(2) || "Unknown"}`,
    `Member Outstanding: ${
      data.outstanding.memberOutstanding.toFixed(2) ?? "Unknown"
    }`,
    `Agent Outstanding: ${
      data.outstanding.agentOutstanding.toFixed(2) ?? "Unknown"
    }`,
    `Reward Receivable: ${data.rewardCurrency} ${
      data.rewardReceivable.toFixed(2) || "Unknown"
    }`,
  ].join("\n");
};

export default function registerGetDownlineBalanceTool(
  server: McpServer,
  NWS_API_BASE: string
) {
  server.tool(
    "get-downline-balance",
    "Retrieves detailed balance information of specific downline of a customer and role.",
    {
      username: z.string().describe("Username of downline"),
      custId: z.number().min(1).describe("Customer ID"),
      roleId: z.number().min(1).max(4).describe("Customer Role ID"),
    },
    async ({ username, custId, roleId }) => {
      const downlineInfoUrl = `${NWS_API_BASE}/Customer/GetDownlineInfo?custId=${custId}&downlineUsername=${username}`;
      const downlineInfo = await makeNWSRequest<DownlineInfoResponse>(
        downlineInfoUrl
      );
      if (!downlineInfo || downlineInfo.custId <= 0) {
        return {
          content: [
            {
              type: "text",
              text: "No information is available",
            },
          ],
        };
      }

      const isValidDirectDownline =
        roleId - downlineInfo.roleId === 1 ||
        (downlineInfo.roleId === 1 && -roleId === downlineInfo.agentId);

      if (!isValidDirectDownline) {
        return {
          content: [
            {
              type: "text",
              text: "No information is available",
            },
          ],
        };
      }

      const downlineBalanceUrl = `${NWS_API_BASE}/BalanceInfo/GetDownlineBalance?custId=${downlineInfo.custId}&custLevelId=${downlineInfo.roleId}`;
      const downlineBalance = await makeNWSRequest<DownlineBalanceResponse>(
        downlineBalanceUrl
      );

      if (!downlineBalance) {
        return {
          content: [
            {
              type: "text",
              text: "No information is available",
            },
          ],
        };
      }

      const formattedDownlineBalance =
        downlineInfo.roleId === 3
          ? formatMasterBalance(downlineBalance)
          : roleId === 2
          ? formatAgentBalance(downlineBalance)
          : formatMemberBalance(downlineBalance);
      const downlinebalanceText = `Balance info of ${username}:\n\n${formattedDownlineBalance}`;

      return {
        content: [
          {
            type: "text",
            text: downlinebalanceText,
          },
        ],
      };
    }
  );
}
