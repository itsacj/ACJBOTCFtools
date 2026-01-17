import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js';

import servers from '../../config/servers.json';
import { SlashCommand } from '../types';
import { getSteamMiniProfile } from '../steam/steam';
import { fetchPlayerStatsFresh } from '../services/playerstats.service';
import { getCFToolsClient } from '../cftools/cftClients';
import { Statistic } from 'cftools-sdk';

/* ================= HELPERS ================= */

function safeNum(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function fmtMeters(m?: number): string {
  return `${safeNum(m).toFixed(2)} m`;
}

function fmtPlaytime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return d > 0 ? `${d}d ${rh}h` : `${h}h`;
}

function big(label: string, value: string): string {
  return `**${label}**\n${value}`;
}

function getFavoriteWeapon(weapons: any) {
  if (!weapons || typeof weapons !== 'object') return null;

  let best: { name: string; kills: number } | null = null;

  for (const [name, data] of Object.entries(weapons)) {
    const kills = safeNum((data as any)?.kills);
    if (!best || kills > best.kills) {
      best = { name, kills };
    }
  }

  return best && best.kills > 0 ? best : null;
}

/* ============== LEADERBOARD RANK BY VALUE ============== */
/**
 * DayZ SA CFTools leaderboard NO garantiza IDs ni nombres.
 * El ÚNICO cruce fiable es por el valor del stat (kills).
 */
async function getRankByValue(
  serverName: string,
  statistic: Statistic,
  playerValue: number
): Promise<{ rank: number; total: number }> {
  const client = getCFToolsClient(serverName);

  const lb = await client.getLeaderboard({
    statistic,
    order: 'ASC',
    limit: 9999
  });

  const total = lb.length;

  const index = lb.findIndex((p: any) => {
    const value =
      typeof p.value === 'number' ? p.value :
      typeof p.kills === 'number' ? p.kills :
      typeof p.stat === 'number' ? p.stat :
      0;

    return value === playerValue;
  });

  if (index === -1) {
    return { rank: -1, total };
  }

  const rank =
    typeof lb[index].rank === 'number'
      ? lb[index].rank
      : index;

  return { rank, total };
}

/* ================= COMMAND ================= */

export const playerstatsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('playerstats')
    .setDescription('📡 PlayerStats DayZ SA By ACJ')
    .addStringOption(o =>
      o.setName('steamid')
        .setDescription('SteamID64 del jugador')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('server')
        .setDescription('Servidor')
        .setRequired(true)
        .addChoices(...(servers as any[]).map(s => ({ name: s.name, value: s.name })))
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const steamId = interaction.options.getString('steamid', true).trim();
    const serverName = interaction.options.getString('server', true);

    let player: any;
    try {
      player = await fetchPlayerStatsFresh(serverName, steamId);
    } catch {
      await interaction.editReply('❌ No se pudo obtener el perfil desde CFTools.');
      return;
    }

    const dz = player?.statistics?.dayz;
    if (!dz) {
      await interaction.editReply('❌ El jugador no tiene estadísticas DayZ.');
      return;
    }

    const steam = await getSteamMiniProfile(steamId);
    const displayName =
      player?.names?.[0] ??
      steam.personaName ??
      'Unknown';

    /* ===== STATS ===== */

    const killsPvp = safeNum(dz?.kills?.players);
    const killsInf = safeNum(dz?.kills?.infected);
    const killsAni = safeNum(dz?.kills?.animals);

    const d = dz?.deaths ?? {};
    const deathsPlayers = safeNum(d.players ?? d.player ?? d.other);
    const deathsSuicides = safeNum(d.suicides ?? d.suicide);
    const deathsInf = safeNum(d.infected ?? d.zombies);
    const deathsAni = safeNum(d.animals ?? d.animal);
    const deathsEnv = safeNum(d.environment ?? d.env);
    const deathsExp = safeNum(d.explosions ?? d.explosion);

    const deathsTotal =
      deathsPlayers +
      deathsSuicides +
      deathsInf +
      deathsAni +
      deathsEnv +
      deathsExp;

    const kd = (killsPvp / Math.max(deathsTotal, 1)).toFixed(2);
    const favWeapon = getFavoriteWeapon(dz?.weapons);
    const playtimeProfile = safeNum(player.playtime);

    // 🔥 RANKING PVP (ÚNICO MÉTODO FIABLE)
    const killsRank = await getRankByValue(
      serverName,
      Statistic.KILLS,
      killsPvp
    );

    /* ================= EMBED ================= */

    const embed = new EmbedBuilder()
      .setTitle('🧬 DayZ Player Profile')
      .setColor(0x00e5ff)
      .setDescription(
        [
          `**${displayName}**`,
          `Servidor: **${serverName}**`,
          steam.countryCode
            ? `País: **${steam.countryCode.toUpperCase()}**`
            : `País: **N/A**`,
          ''
        ].join('\n')
      );

    if (steam.avatarUrl) embed.setThumbnail(steam.avatarUrl);

    embed.addFields(
      // Combat
      { name: '🔫 Kills PVP', value: big('Total', `${killsPvp}`), inline: true },
      { name: '🧟 Kills Infected', value: big('Total', `${killsInf}`), inline: true },
      { name: '🐺 Kills Animals', value: big('Total', `${killsAni}`), inline: true },

      // Deaths
      { name: '💀 Deaths', value: big('Total', `${deathsTotal}`), inline: true },
      { name: '☠️ Suicides', value: big('Total', `${deathsSuicides}`), inline: true },
      { name: '📈 KD', value: big('Ratio', kd), inline: true },

      // Profile / Leaderboard
      { name: '⏱ Playtime', value: big('Total', fmtPlaytime(playtimeProfile)), inline: true },
      {
        name: '🏆 Ranking PVP',
        value: big(
          'Posición',
          killsRank.rank >= 0
            ? `#${killsRank.rank + 1} / ${killsRank.total}`
            : 'Fuera del top'
        ),
        inline: true
      },
      {
        name: '🔫 Favorite Weapon',
        value: favWeapon
          ? `**${favWeapon.name}**\n${favWeapon.kills} kills`
          : 'N/A',
        inline: true
      },

      // Precision
      { name: '🎯 Longest Kill', value: big('Distance', fmtMeters(dz?.longestKill)), inline: true },
      { name: '🏹 Longest Shot', value: big('Distance', fmtMeters(dz?.longestShot)), inline: true },
      { name: ' ', value: ' ', inline: true },

      // 🔒 BREAKDOWN — NO SE TOCA
      {
        name: '🧾 Deaths Breakdown',
        value: [
          `Players: **${deathsPlayers}**`,
          `Suicides: **${deathsSuicides}**`,
          `Infected: **${deathsInf}**`,
          `Animals: **${deathsAni}**`,
          `Environment: **${deathsEnv}**`,
          `Explosions: **${deathsExp}**`
        ].join(' • '),
        inline: false
      }
    );

    embed.setFooter({
      text: 'CFTools DB BY ACJ • Player profile + leaderboard info'
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
