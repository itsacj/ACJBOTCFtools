// src/listeners/ready.ts
import { Client } from 'discord.js';
import { cftoolsClients } from '../cftools/cftClients';

export const onReady = async (client: Client) => {
  console.log(`Bot conectado como ${client.user?.tag}`);


  for (const [name] of Object.entries(cftoolsClients)) {
    console.log(`CFTools client ready for server: ${name}`);
  }
};
