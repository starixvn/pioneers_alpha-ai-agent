const HEADERS = {
  "Uesr-Agent": "alpha-api/1.0",
  Accept: "application/geo+json",
};
const DECIMALFORMAT = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export async function makeNWSRequest<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { headers: HEADERS });
    return await buildResponse<T>(response);
  } catch (error) {
    console.error("Error making GET request:", error);
    return null;
  }
}

export async function post<T>(url: string, data: any): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(data),
    });
    return await buildResponse<T>(response);
  } catch (error) {
    console.error("Error making POST request:", error);
    return null;
  }
}

async function buildResponse<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getRoleName(roleId: number) {
  switch (roleId) {
    case 4:
      return "Super";
    case 3:
      return "Master";
    case 2:
      return "Agent";
    case 1:
      return "Member";
    default:
      return "Unknown";
  }
}

export function formatDecimal(value: number) {
  return DECIMALFORMAT.format(value);
}
