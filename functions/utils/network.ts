
export const getIP = async (): Promise<string | null> => {
  try {
    const res = await fetch("https://api64.ipify.org?format=json");
    const data = await res.json();
    return data.ip || null;
  } catch (error) {
    console.warn("Failed to fetch IP address:", error);
    return null; // fallback if API fails
  }
};
