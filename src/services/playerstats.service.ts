import { getCFToolsClient } from '../cftools/cftClients';

export async function fetchPlayerStatsFresh(
  serverName: string,
  steamId: string
): Promise<any> {
  const client = getCFToolsClient(serverName);

  // SDK v3.6.0: autenticación interna, sin cache
  return client.getPlayerDetails({ id: steamId });
}
