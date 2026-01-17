import type { LeaderboardItem } from 'cftools-sdk';
import { Statistic } from 'cftools-sdk';
import { getCFToolsClient } from '../cftools/cftClients';

export async function fetchLeaderboardFresh(
  serverName: string,
  statistic: Statistic,
  limit: number
): Promise<LeaderboardItem[]> {
  const client = getCFToolsClient(serverName);

  return client.getLeaderboard({
    statistic,
    order: 'ASC',
    limit,
  });
}
