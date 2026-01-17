import fetch from 'node-fetch';
import { getApiToken } from './token';

export async function lookupCFToolsId(steamId: string): Promise<string | null> {
  const res = await fetch(
    `https://data.cftools.cloud/v1/users/lookup?identifier=${steamId}`,
    {
      headers: {
        Authorization: `Bearer ${await getApiToken()}`
      }
    }
  );

  if (!res.ok) return null;

  const json = (await res.json()) as { cftools_id?: string };
  return json.cftools_id ?? null;
}

export async function fetchPlayerExtended(
  serverApiId: string,
  cftoolsId: string
): Promise<any> {
  const res = await fetch(
    `https://data.cftools.cloud/v1/server/${serverApiId}/player?cftools_id=${cftoolsId}`,
    {
      headers: {
        Authorization: `Bearer ${await getApiToken()}`
      }
    }
  );

  if (!res.ok) return null;
  return res.json();
}
