import { ALPHA_API_BASE } from "../config";
import { makeNWSRequest } from "../helpers";
import {
  BalanceInfoResponse,
  DownlineBalanceResponse,
  TopBalanceResponse,
  WinLossResponse,
  DownlineInfoResponse,
  OutstandingResponse,
  DomainResponse,
} from "./alpha_api.types";

export async function getBalance(custId: number, roleId: number) {
  const url = `${ALPHA_API_BASE}/BalanceInfo/GetCustomerBalance?custId=${custId}&custLevelId=${roleId}`;
  return await makeNWSRequest<BalanceInfoResponse>(url);
}

export async function getDownlineBalance(
  custId: number,
  roleId: number,
  username: string
): Promise<DownlineBalanceResponse | null> {
  const downlineInfo = await getDownlineInfo(custId, username);

  if (!downlineInfo || !isDirectDownline(roleId, downlineInfo)) {
    return null;
  }

  const url = `${ALPHA_API_BASE}/BalanceInfo/GetDownlineBalance?custId=${downlineInfo.custId}&custLevelId=${downlineInfo.roleId}`;
  const balance = await makeNWSRequest<DownlineBalanceResponse>(url);
  balance?.roleId === downlineInfo.roleId;

  return balance;
}

export async function getTopBalance(
  custId: number,
  roleId: number,
  top: number
) {
  const url = `${ALPHA_API_BASE}/BalanceInfo/GetTopBalance?custId=${custId}&custLevelId=${roleId}&top=${top}`;
  return await makeNWSRequest<TopBalanceResponse[]>(url);
}

export async function getTopWinLoss(
  custId: number,
  roleId: number,
  fromDate: string,
  toDate: string,
  top: number
) {
  const url = `${ALPHA_API_BASE}/WinLoss/GetTopUsername2?custId=${custId}&custLevelId=${roleId}&fromDate=${fromDate}&toDate=${toDate}&top=${top}`;
  return await makeNWSRequest<string[]>(url);
}

export async function getWinLoss(
  custId: number,
  roleId: number,
  fromDate: string,
  toDate: string,
  groupProduct: string
) {
  const url = `${ALPHA_API_BASE}/WinLoss/GetWinLoss2?custId=${custId}&custLevelId=${roleId}&fromDate=${fromDate}&toDate=${toDate}&groupProduct=${groupProduct}`;
  return await makeNWSRequest<WinLossResponse>(url);
}

export async function getDownlineOutstanding(
  custId: number,
  roleId: number,
  username: string,
  siteLabel: string,
  language: string = "en-US"
) {
  const downlineInfo = await getDownlineInfo(custId, username);
  if (!downlineInfo || !isDirectDownline(roleId, downlineInfo)) {
    return null;
  }

  const url = `${ALPHA_API_BASE}/Outstanding/GetDownlineOutstanding?custId=${custId}&custLevelId=${roleId}&downlineId=${
    downlineInfo.custId
  }&downlineLevelId=${
    downlineInfo.roleId + 1
  }&siteLabel=${siteLabel}&language=${language}`;
  return await makeNWSRequest<OutstandingResponse>(url);
}

export async function getTopOutstanding(
  custId: number,
  roleId: number,
  top: number
) {
  const url = `${ALPHA_API_BASE}/Outstanding/GetTopOutstanding?custId=${custId}&custLevelId=${roleId}&top=${top}`;
  return await makeNWSRequest<OutstandingResponse>(url);
}

export async function getDomains(site: string) {
  const url = `${ALPHA_API_BASE}/Customer/GetDomains?site=${site}`;
  return await makeNWSRequest<DomainResponse[]>(url);
}

async function getDownlineInfo(custId: number, downlineUsername: string) {
  const url = `${ALPHA_API_BASE}/Customer/GetDownlineInfo?custId=${custId}&downlineUsername=${downlineUsername}`;
  const downlineInfo = await makeNWSRequest<DownlineInfoResponse>(url);

  if (!downlineInfo || downlineInfo.custId <= 0) {
    return null;
  }

  return downlineInfo;
}

function isDirectDownline(
  roleId: number,
  downlineInfo: DownlineInfoResponse
): boolean {
  return (
    roleId - downlineInfo.roleId === 1 ||
    (downlineInfo.roleId === 1 && -roleId === downlineInfo.agentId)
  );
}
