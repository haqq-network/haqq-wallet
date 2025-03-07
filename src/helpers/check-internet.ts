const endpoints: string[] = [
  'https://www.google.com/generate_204',
  'https://connectivitycheck.gstatic.com/generate_204',
  'https://captive.apple.com/generate_204',
  'https://www.cloudflare.com/cdn-cgi/trace',
];

async function fetchWithTimeout(
  url: string,
  timeout = 5000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {signal: controller.signal});
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function isConnected(): Promise<boolean> {
  try {
    await Promise.any(endpoints.map(url => fetchWithTimeout(url)));
    return true;
  } catch (error) {
    return false;
  }
}
