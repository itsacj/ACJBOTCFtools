import fetch from 'node-fetch';

const {
  CFTOOLS_API_APPLICATION_ID,
  CFTOOLS_API_SECRET
} = process.env;

if (!CFTOOLS_API_APPLICATION_ID || !CFTOOLS_API_SECRET) {
  throw new Error('❌ Missing CFTools credentials');
}

let cachedToken: string | null = null;
let expiresAt = 0;

export async function getApiToken(): Promise<string> {
  if (cachedToken && Date.now() < expiresAt) {
    return cachedToken;
  }

  const res = await fetch('https://data.cftools.cloud/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      application_id: CFTOOLS_API_APPLICATION_ID,
      secret: CFTOOLS_API_SECRET
    })
  });

  if (!res.ok) {
    throw new Error(`CFTools auth failed: ${res.status}`);
  }

  const json = (await res.json()) as { token: string };

  cachedToken = json.token;
  expiresAt = Date.now() + 1000 * 60 * 60 * 23; // 23h

  return cachedToken;
}
