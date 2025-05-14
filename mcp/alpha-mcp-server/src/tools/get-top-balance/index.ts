import { z } from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { makeNWSRequest } from "../../helpers";
import { TopBalanceResponse } from "./types";

const formatTopBalance = (data: TopBalanceResponse[]) => {
  const topBalance = data.map((item) =>
    [
      `Username: ${item.userName || "Unknown"}`,
      `Balance: ${item.balance.toFixed(2) || "Unknown"}`,
    ].join("\n")
  );

  return topBalance.join("\n");
};

export default function registerGetTopBalanceTool(
  server: McpServer,
  NWS_API_BASE: string
) {
  server.tool(
    "get-top-balance",
    "Retrieves a list of accounts that have highest balance amount for a specific customer and role.",
    {
      custId: z.number().min(1).describe("Customer ID"),
      roleId: z.number().min(1).max(4).describe("Customer Role ID"),
      top: z
        .number()
        .min(1)
        .max(1000)
        .describe("Number of top accounts to retrieve"),
    },
    async ({ custId, roleId, top }) => {
      const url = `${NWS_API_BASE}/BalanceInfo/GetTopBalance?custId=${custId}&custLevelId=${roleId}&top=${top}`;
      const data = await makeNWSRequest<TopBalanceResponse[]>(url);

      if (!data) {
        return {
          content: [
            {
              type: "text",
              text: "No information available.",
            },
          ],
        };
      }

      const formattedTopBalance = formatTopBalance(data);
      const topBalanceText = `Top ${top} balance:\n\n${formattedTopBalance}`;

      return {
        content: [
          {
            type: "text",
            text: topBalanceText,
          },
        ],
      };
    }
  );
}
