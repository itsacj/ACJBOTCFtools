import 'dotenv/config';
import { REST, Routes } from 'discord.js';

import { leaderboardCommand } from './commands/leaderboard';
import { playerstatsCommand } from './commands/playerstats';

const commands = [
  leaderboardCommand.data.toJSON(),
  playerstatsCommand.data.toJSON()
];

async function deploy() {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error('Falta DISCORD_TOKEN');
  }

  if (!process.env.DISCORD_CLIENT_ID) {
    throw new Error('Falta DISCORD_CLIENT_ID');
  }

  const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

  console.log('⏳ Registrando comandos slash...');

  await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
    { body: commands }
  );

  console.log('✅ Comandos registrados correctamente');
}

deploy().catch(err => {
  console.error('❌ Error registrando comandos', err);
});
