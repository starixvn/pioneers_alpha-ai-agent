import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatDecimal } from "../helpers";
import { getTopBalance } from "../api/alpha_api";
import { TopBalanceResponse } from "../api/alpha_api.types";

function formatTopBalance(data: TopBalanceResponse[]) {
  const topBalance = data.map((item) => [
    `${item.username}:  ${formatDecimal(item.balance)}`,
  ]);

  return topBalance.join("\n");
}

export default function registerTopBalanceTool(server: McpServer) {
  server.tool(
    "top-x-balance",
    "[Top Balance Lookup] Retrieve a list of accounts with the highest balances for a specific customer and role. Use this tool when the user asks for top balances, richest accounts, or highest balance holders. Input required: Customer ID, Role ID (2=Agent, 3=Master, 4=Super), and the number of top accounts to retrieve.",
    {
      custId: z.number().min(1).describe("Customer ID"),
      roleId: z
        .number()
        .min(2)
        .max(4)
        .describe(
          "Customer Role ID (e.g., 4 = Super, 3 = Master, 2 = Agent)"
        ),
      top: z
        .number()
        .min(1)
        .max(100)
        .default(1)
        .describe("Number of top accounts to retrieve"),
    },
    async ({ custId, roleId, top }) => {
      const balance = await getTopBalance(custId, roleId, top);
      const balanceText = balance
        ? `Top ${top} Balance:\n${formatTopBalance(balance)}`
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
