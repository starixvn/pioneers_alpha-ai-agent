interface OutStanding {
  superOutstanding: number;
  masterOutstanding: number;
  agentOutstanding: number;
  memberOutstanding: number;
}

// export interface TotalDownline {
//   roleId: number;
//   totalActive: number;
//   totalClosed: number;
//   totalSuspended: number;
//   agentID: number;
// }

export interface DownlineBalanceResponse {
  totalCash: number;
  yesterdayCash: number;
  totalBalance: number;
  yesterdayBalance: number;
  pendingTransfer3rd: number;
  usedCredit: number;
  givenCredit: number;
  memberMaxCredit: number;
  //totalDownlines: TotalDownline[];
  netPosition: number;
  betCredit: number;
  outstanding: OutStanding;
  rewardReceivable: number;
  rewardPayable: number;
  rewardCurrency: string;
}

export interface DownlineInfoResponse {
  custId: number;
  roleId: number;
  isSubAcc: number;
  agentId: number;
}
