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

const formatMasterWinLoss = (data: WinLossResponse) => {
  return [
    `Turnover: ${data.turnover}`,
    `Gross Commission: ${data.grossComm}`,
    `Downline Total: ${data.masterTotal}`,
    `Super Win/Loss: ${data.superWinLoss}`,
    `Super Commission: ${data.superComm}`,
    `Super Total: ${data.superTotal}`,
    `Company Win/Loss: ${data.companyWinLoss}`,
    "---",
  ].join("\n");
};

const formatAgentWinLoss = (data: WinLossResponse) => {
  return [
    `Turnover: ${data.turnover}`,
    `Gross Commission: ${data.grossComm}`,
    `Downline Total: ${data.agentTotal}`,
    `Master Win/Loss: ${data.masterWinLoss}`,
    `Master Commission: ${data.masterComm}`,
    `Master Total: ${data.masterTotal}`,
    `Company Win/Loss: ${data.companyWinLoss}`,
    "---",
  ].join("\n");
};

const formatMemberWinLoss = (data: WinLossResponse) => {
  return [
    `Turnover: ${data.turnover}`,
    `Gross Commission: ${data.grossComm}`,
    `Member Win/Loss: ${data.memberWinLoss}`,
    `Member Commission: ${data.memberComm}`,
    `Member Total: ${data.memberTotal}`,
    `Agent Win/Loss: ${data.agentWinLoss}`,
    `Agent Commission: ${data.agentComm}`,
    `Agent Total: ${data.agentTotal}`,
    `Company Win/Loss: ${data.companyWinLoss}`,
    "---",
  ].join("\n");
};

const formatMemberDownlineWinLoss = (data: WinLossResponse) => {
  return [
    `Member Win/Loss: ${data.memberWinLoss}`,
    `Member Commission: ${data.memberComm}`,
    `Member Total: ${data.memberTotal}`,
  ].join("\n");
};

export const formatWinLoss = (data: WinLossResponse, roleId: number) => {
  switch (roleId) {
    case 4:
      return formatMasterWinLoss(data);
    case 3:
      return formatAgentWinLoss(data);
    case 2:
      return formatMemberWinLoss(data);
    default:
      return formatMemberDownlineWinLoss(data);
  }
};
