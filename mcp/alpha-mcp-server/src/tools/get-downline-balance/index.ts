// import { z } from "zod";

// import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// import { getRoleName, makeNWSRequest } from "../../helpers";
// import { BalanceDownlineResponse, OutStanding, TotalDownline } from "./types";

// const getOutstanding = (outstanding: OutStanding, roleId: number) => {
//   switch (roleId) {
//     case 4:
//       return outstanding.superOutstanding;
//     case 3:
//       return outstanding.masterOutstanding;
//     case 2:
//       return outstanding.agentOutstanding;
//     case 1:
//       return outstanding.memberOutstanding;
//     default:
//       return 0;
//   }
// };

// const formatBalanceInfo = (data: BalanceDownlineResponse, roleId: number) => {
//   const results = [];
//   return [
//     `Currency: ${data.currencyName || "Unknown"}`,
//     `Cash: ${data.cashBalance.toFixed(2) || "Unknown"}`,
//     `Yesterday Cash: ${data.yesterdayCashBalance.toFixed(2) || "Unknown"}`,
//     `Balance: ${data.totalBalance.toFixed(2) || "Unknown"}`,
//     `Yesterday Balance: ${data.yesterdayTotalBalance.toFixed(2) || "Unknown"}`,
//     `Today Win/Loss: ${data.todayWinLoss.toFixed(2) || "Unknown"}`,
//     `Yesterday Win/Loss: ${data.yesterdayWinLoss.toFixed(2) || "Unknown"}`,
//     `3rd Party Pending Transfer: ${
//       data.pendingTransfer3rd.toFixed(2) || "Unknown"
//     }`,
//     `Given Credit: ${data.givenCredit || "Unknown"}`,
//     `${getRoleName(roleId - 1)} Credit: ${data.memberCredit || "Unknown"}`,
//     `Member Outstanding: ${data.outstanding.memberOutstanding || "Unknown"}`,
//     `${getRoleName(roleId)} Outstanding: ${
//       getOutstanding(data.outstanding, roleId)?.toFixed(2) ?? "Unknown"
//     }`,
//     `Reward Receivable: ${data.rewardCurrency} ${
//       data.rewardReceivable.toFixed(2) || "Unknown"
//     }`,
//     `Reward Payable: ${data.rewardCurrency} ${
//       data.rewardPayable.toFixed(2) || "Unknown"
//     }`,
//   ].join("\n");
// };

// export default function registerGetBalanceInfoTool(
//   server: McpServer,
//   NWS_API_BASE: string
// ) {
//   server.tool(
//     "get-balance-info",
//     "Retrieves detailed balance information for a specific customer and role.",
//     {
//       custId: z.number().min(1).describe("Customer ID"),
//       roleId: z.number().min(1).max(4).describe("Customer Role ID"),
//     },
//     async ({ custId, roleId }) => {
//       const url = `${NWS_API_BASE}/BalanceInfo/GetCustomerBalance?custId=${custId}&custLevelId=${roleId}`;
//       const data = await makeNWSRequest<BalanceInfoResponse>(url);

//       if (!data) {
//         return {
//           content: [
//             {
//               type: "text",
//               text: "Failed to retrieve balance info",
//             },
//           ],
//         };
//       }

//       const formattedBalanceInfo = formatBalanceInfo(data, roleId);
//       const balanceInfoText = `Your balance info:\n\n${formattedBalanceInfo}`;

//       return {
//         content: [
//           {
//             type: "text",
//             text: balanceInfoText,
//           },
//         ],
//       };
//     }
//   );
// }
