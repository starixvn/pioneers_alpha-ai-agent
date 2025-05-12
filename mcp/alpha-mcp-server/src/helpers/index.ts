const USER_AGENT = "alpha-api/1.0";

// Helper function for making NWS API requests
async function makeNWSRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
  };

  try {
    console.log("url", url);
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

const getRoleName = (roleId: number) => {
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
};

export { makeNWSRequest, getRoleName };
