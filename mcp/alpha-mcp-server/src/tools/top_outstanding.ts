import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getRoleName, formatDecimal } from "../helpers";
import { getTopOutstanding } from "../api/alpha_api";
import { OutstandingModel, OutstandingResponse } from "../api/alpha_api.types";

function formatTopOutstanding(response: OutstandingResponse, roleName: string) {
  const formatOutstandingRow = (data: OutstandingModel) =>
    [
      `${data.name}${data.isDirectMember ? " (Direct Member)" : ""}`,
      `Member Outstanding: ${formatDecimal(data.memberOutstanding)}`,
      `${roleName} Outstanding: ${formatDecimal(data.outstanding)}`,
      `Sportsbook Risk Amount/To Win: ${
        data.toWin ? formatDecimal(data.toWin) : "N/A"
      }`,
      `Sportsbook Risk Amount/${roleName} Risk: ${
        data.riskAmount ? formatDecimal(data.riskAmount) : "N/A"
      }`,
    ].join("\n");

  const outstandingRows = response.outstandings.map((item) =>
    formatOutstandingRow(item)
  );

  outstandingRows.push(formatOutstandingRow(response.total));

  return outstandingRows.join("\n\n");
}

export default function registerTopOutstandingTool(server: McpServer) {
  server.tool(
    "top-x-outstanding",
    "[Top Outstanding Lookup] Retrieve a list of accounts with the highest outstanding amounts for a specific customer and role. Use this tool when the user asks for top outstanding, highest liability, or most exposed accounts. Input required: Customer ID, Role ID (2=Agent, 3=Master, 4=Super), and the number of top accounts to retrieve.",
    {
      custId: z.number().min(1).describe("Customer ID"),
      roleId: z
        .number()
        .min(2)
        .max(4)
        .describe("Customer Role ID (e.g., 4 = Super, 3 = Master, 2 = Agent)"),
      top: z
        .number()
        .min(1)
        .max(100)
        .default(1)
        .describe("Number of top accounts to retrieve"),
    },
    async ({ custId, roleId, top }) => {
      const data = await getTopOutstanding(custId, roleId, top);

      return {
        content: [
          {
            type: "text",
            text:
              data && data.outstandings.length > 0
                ? `Top ${top} Outstanding:\n${formatTopOutstanding(
                    data,
                    getRoleName(roleId)
                  )}`
                : "No information is available.",
          },
        ],
      };
    }
  );
}
