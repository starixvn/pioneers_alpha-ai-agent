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

// export interface TotalDownline {
//   roleId: number;
//   totalActive: number;
//   totalClosed: number;
//   totalSuspended: number;
//   agentID: number;
// }

export interface DownlineBalanceResponse {
  roleId: number;
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

export interface TopBalanceResponse {
  username: string;
  balance: number;
}

export interface WinLossResponse {
  superWinLoss: number;
  superComm: number;
  superTotal: number;
  companyWinLoss: number;
  turnover: number;
  grossComm: number;
  masterWinLoss: number;
  masterComm: number;
  masterTotal: number;
  agentWinLoss: number;
  agentComm: number;
  agentTotal: number;
  memberWinLoss: number;
  memberComm: number;
  memberTotal: number;
}

export interface OutstandingModel {
  name: string;
  memberOutstanding: number;
  outstanding: number;
  toWin?: number;
  riskAmount?: number;
  isDirectMember: boolean;
}

export interface OutstandingResponse {
  outstandings: OutstandingModel[];
  total: OutstandingModel;
}

export interface DownlineInfoResponse {
  custId: number;
  roleId: number;
  isSubAcc: number;
  agentId: number;
}

export interface DomainResponse {
  domain: string;
  isAgency: boolean;
}
