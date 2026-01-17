import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { leaderboardCommand } from './commands/leaderboard';
import { playerstatsCommand } from './commands/playerstats';
import { onReady } from './listeners/ready';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = new Map([
  [leaderboardCommand.data.name, leaderboardCommand],
  [playerstatsCommand.data.name, playerstatsCommand]
]);

client.once(Events.ClientReady, () => onReady(client));

client.on(Events.InteractionCreate, async i => {
  if (!i.isChatInputCommand()) return;
  const cmd = commands.get(i.commandName);
  if (cmd) await cmd.execute(i);
});

client.login(process.env.DISCORD_TOKEN);
