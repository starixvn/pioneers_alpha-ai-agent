import { getRoleName } from "../helpers";

export interface OutStanding {
  superOutstanding: number;
  masterOutstanding: number;
  agentOutstanding: number;
  memberOutstanding: number;
}

export interface BalanceInfoResponse {
  currencyName: string;
  cashBalance: number;
  yesterdayCashBalance: number;
  totalBalance: number;
  yesterdayTotalBalance: number;
  todayWinLoss: number;
  yesterdayWinLoss: number;
  givenCredit: number;
  memberCredit: number;
  pendingTransfer3rd: number;
  outstanding: OutStanding;
  rewardReceivable: number;
  rewardPayable: number;
  rewardCurrency: string;
  directMemberCredit: string;
}

const getOutstanding = (outstanding: OutStanding, roleId: number) => {
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
};

export const formatBalanceInfo = (
  data: BalanceInfoResponse,
  roleId: number
) => {
  return [
    `Currency: ${data.currencyName || "Unknown"}`,
    `Cash: ${data.cashBalance.toFixed(2) || "Unknown"}`,
    `Yesterday Cash: ${data.yesterdayCashBalance.toFixed(2) || "Unknown"}`,
    `Balance: ${data.totalBalance.toFixed(2) || "Unknown"}`,
    `Yesterday Balance: ${data.yesterdayTotalBalance.toFixed(2) || "Unknown"}`,
    `Today Win/Loss: ${data.todayWinLoss.toFixed(2) || "Unknown"}`,
    `Yesterday Win/Loss: ${data.yesterdayWinLoss.toFixed(2) || "Unknown"}`,
    `3rd Party Pending Transfer: ${
      data.pendingTransfer3rd.toFixed(2) || "Unknown"
    }`,
    `Given Credit: ${data.givenCredit || "Unknown"}`,
    `${getRoleName(roleId - 1)} Credit: ${data.memberCredit || "Unknown"}`,
    `Member Outstanding: ${data.outstanding.memberOutstanding || "Unknown"}`,
    `${getRoleName(roleId)} Outstanding: ${
      getOutstanding(data.outstanding, roleId)?.toFixed(2) ?? "Unknown"
    }`,
    `Reward Receivable: ${data.rewardCurrency} ${
      data.rewardReceivable.toFixed(2) || "Unknown"
    }`,
    `Reward Payable: ${data.rewardCurrency} ${
      data.rewardPayable.toFixed(2) || "Unknown"
    }`,
    "---",
  ].join("\n");
};
