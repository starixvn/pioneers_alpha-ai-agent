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
