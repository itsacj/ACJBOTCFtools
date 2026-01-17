import { CFToolsClientBuilder } from 'cftools-sdk';
import servers from '../../config/servers.json';

const {
  CFTOOLS_API_APPLICATION_ID,
  CFTOOLS_API_SECRET
} = process.env;

if (!CFTOOLS_API_APPLICATION_ID || !CFTOOLS_API_SECRET) {
  throw new Error('❌ Missing CFTools credentials');
}

type ClientMap = Record<string, any>;

export const cftoolsClients: ClientMap = {};

for (const server of servers as any[]) {
  if (!server.name || !server.serverApiId) continue;

  cftoolsClients[server.name] = new CFToolsClientBuilder()
    // 🔥 SIN withCache → siempre fresh
    .withServerApiId(server.serverApiId)
    .withCredentials(
      CFTOOLS_API_APPLICATION_ID,
      CFTOOLS_API_SECRET
    )
    .build();

  console.log(`CFTools client ready for server: ${server.name}`);
}

export function getCFToolsClient(serverName: string) {
  const client = cftoolsClients[serverName];
  if (!client) {
    throw new Error(`CFTools client not found for server: ${serverName}`);
  }
  return client;
}
