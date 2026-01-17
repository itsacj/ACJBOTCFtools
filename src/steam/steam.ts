import fetch from 'node-fetch';

export type SteamMiniProfile = {
  avatarUrl: string | null;
  countryCode: string | null;
  personaName: string | null;
};

type SteamPlayersResponse = {
  response?: {
    players?: Array<{
      personaname?: string;
      avatarfull?: string;
      avatarmedium?: string;
      avatar?: string;
      loccountrycode?: string;
    }>;
  };
};

export async function getSteamMiniProfile(steamId64: string): Promise<SteamMiniProfile> {
  const apiKey = process.env.STEAM_API_KEY;

  // No reventamos el bot si falta la key: simplemente devolvemos vacío.
  if (!apiKey) {
    return { avatarUrl: null, countryCode: null, personaName: null };
  }

  const url =
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/` +
    `?key=${encodeURIComponent(apiKey)}&steamids=${encodeURIComponent(steamId64)}`;

  const res = await fetch(url);
  if (!res.ok) {
    return { avatarUrl: null, countryCode: null, personaName: null };
  }

  const json = (await res.json()) as SteamPlayersResponse;
  const p = json?.response?.players?.[0];

  return {
    avatarUrl: p?.avatarfull ?? p?.avatarmedium ?? p?.avatar ?? null,
    countryCode: p?.loccountrycode ?? null,
    personaName: p?.personaname ?? null
  };
}
