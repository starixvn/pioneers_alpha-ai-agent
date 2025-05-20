import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getRoleName, formatDecimal } from "../helpers";
import { getDownlineOutstanding } from "../api/alpha_api";
import { OutstandingModel, OutstandingResponse } from "../api/alpha_api.types";

function formatDownlineOutstanding(
  response: OutstandingResponse,
  roleName: string
) {
  const formatOutstandingRow = (data: OutstandingModel) =>
    [
      data.name,
      `Member Outstanding: ${formatDecimal(data.memberOutstanding)}`,
      `Sportsbook Risk Amount/To Win: ${
        data.toWin ? formatDecimal(data.toWin) : "N/A"
      }`,
      `${roleName} Outstanding: ${formatDecimal(data.outstanding)}`,
      `Sportsbook Risk Amount/${roleName} Risk: ${
        data.riskAmount ? formatDecimal(data.riskAmount) : "N/A"
      }`,
    ].join("\n");

  const outstandingRows = response.outstandings.map((item) =>
    formatOutstandingRow(item)
  );

  outstandingRows.push(formatOutstandingRow(response.total));

  return outstandingRows.join("\n----------");
}

export default function registerDownlineOutstandingTool(server: McpServer) {
  server.tool(
    "outstanding-by-username",
    "Retrieves detailed outstanding information for a specific down line by username of a customer and role",
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
      const data = await getDownlineOutstanding(custId, roleId, username);

      return {
        content: [
          {
            type: "text",
            text:
              data && data.outstandings.length > 0
                ? `Outstanding of ${username}:\n${formatDownlineOutstanding(
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
