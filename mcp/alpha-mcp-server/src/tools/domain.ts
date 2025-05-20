import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDomains } from "../api/alpha_api";
import { DomainResponse } from "../api/alpha_api.types";

function formatDomains(data: DomainResponse[]) {
  const agencyDomains: string[] = [];
  const memberDomains: string[] = [];

  data.forEach((item) => {
    if (item.isAgency) {
      agencyDomains.push(item.domain);
    } else {
      memberDomains.push(item.domain);
    }
  });

  return [
    "Agency Domains",
    ...agencyDomains,
    "Member Domains",
    ...memberDomains,
  ].join("\n");
}

export default function registerDomainTool(server: McpServer) {
  server.tool(
    "available-domains",
    "Retrieves a list of available domains include agency and member for a specific site",
    {
      site: z.string().describe("Site name (e.g., MBC, IBC, 789y)"),
    },
    async ({ site }) => {
      const data = await getDomains(site);
      const balanceText =
        data && data.length > 0
          ? `${formatDomains(data)}`
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
