import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

import type { LeaderboardItem } from 'cftools-sdk';
import { Statistic } from 'cftools-sdk';
import servers from '../../config/servers.json';
import { SlashCommand } from '../types';
import { fetchLeaderboardFresh } from '../services/leaderboard.service';

const PAGE_SIZE = 15;
const FETCH_LIMIT = 100;

type LeaderboardItemExtended = LeaderboardItem & {
  killDeathRatio?: number;
  killDeathRation?: number;
  kdRatio?: number;
  kdratio?: number;
};

type StatKey =
  | 'OVERALL'
  | 'KILLS'
  | 'DEATHS'
  | 'KILL_DEATH_RATIO'
  | 'LONGEST_KILL'
  | 'LONGEST_SHOT'
  | 'PLAYTIME'
  | 'SUICIDES';

const statMap: Record<Exclude<StatKey, 'OVERALL'>, Statistic> = {
  KILLS: Statistic.KILLS,
  DEATHS: Statistic.DEATHS,
  KILL_DEATH_RATIO: Statistic.KILL_DEATH_RATIO,
  LONGEST_KILL: Statistic.LONGEST_KILL,
  LONGEST_SHOT: Statistic.LONGEST_SHOT,
  PLAYTIME: Statistic.PLAYTIME,
  SUICIDES: Statistic.SUICIDES,
};

function getKD(p: LeaderboardItemExtended): number {
  const direct =
    p.killDeathRatio ??
    p.killDeathRation ??
    p.kdRatio ??
    p.kdratio;

  if (typeof direct === 'number' && Number.isFinite(direct)) return direct;

  const kills = typeof p.kills === 'number' ? p.kills : 0;
  const deaths = typeof p.deaths === 'number' ? p.deaths : 0;
  return kills / Math.max(deaths, 1);
}

function fmtPlaytime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function safeNum(n: unknown): number {
  const x = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(x) ? x : 0;
}

function sortByRank(data: LeaderboardItem[]): LeaderboardItem[] {
  return [...data].sort(
    (a, b) => safeNum((a as any).rank) - safeNum((b as any).rank)
  );
}

export const leaderboardCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('DayZ leaderboard (BY ACJ)')
    .addStringOption(o =>
      o.setName('server')
        .setDescription('Servidor')
        .setRequired(true)
        .addChoices(...servers.map(s => ({ name: s.name, value: s.name })))
    )
    .addStringOption(o =>
      o.setName('type')
        .setDescription('Tipo de top')
        .setRequired(false)
        .addChoices(
          { name: 'Overall', value: 'OVERALL' },
          { name: 'Kills', value: 'KILLS' },
          { name: 'Kill Death Ratio', value: 'KILL_DEATH_RATIO' },
          { name: 'Longest Kill', value: 'LONGEST_KILL' },
          { name: 'Longest Shot', value: 'LONGEST_SHOT' },
          { name: 'Playtime', value: 'PLAYTIME' },
          { name: 'Deaths', value: 'DEATHS' },
          { name: 'Suicides', value: 'SUICIDES' },
        )
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const serverName = interaction.options.getString('server', true);
    const statKey = (interaction.options.getString('type') ?? 'OVERALL') as StatKey;

    const server = (servers as any[]).find(s => s.name === serverName);
    if (!server) {
      await interaction.editReply('❌ Servidor inválido');
      return;
    }

    const isOverall = statKey === 'OVERALL';
    const mappedStat = isOverall ? Statistic.KILLS : statMap[statKey];

    let raw: LeaderboardItem[];
    try {
      raw = await fetchLeaderboardFresh(server.name, mappedStat, FETCH_LIMIT);
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Error consultando CFTools (leaderboard)');
      return;
    }

    const leaderboard = sortByRank(raw);

    let page = 0;
    const maxPage = Math.ceil(leaderboard.length / PAGE_SIZE);
    const sessionId = interaction.id;

    const title = isOverall
      ? `🏆 Overall Leaderboard – ${server.name}`
      : `🏆 ${statKey.replaceAll('_', ' ')} – ${server.name}`;

    const buildEmbed = (pageIndex: number) => {
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(0xf1c40f)
        .setFooter({ text: `Página ${pageIndex + 1}/${maxPage}` });

      leaderboard
        .slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE)
        .forEach((p0, i) => {
          const p = p0 as LeaderboardItemExtended;
          const rank = safeNum((p as any).rank) || (pageIndex * PAGE_SIZE + i + 1);
          const name = (p as any).name ?? 'Unknown';

          if (isOverall) {
            embed.addFields({
              name: `#${rank} ${name}`,
              value:
                `🔫 Kills: **${safeNum((p as any).kills)}**\n` +
                `💀 Deaths: **${safeNum((p as any).deaths)}**\n` +
                `📈 KD: **${getKD(p).toFixed(2)}**\n` +
                `🎯 LK: **${safeNum((p as any).longestKill).toFixed(1)} m**`,
              inline: true,
            });
          } else {
            let value = '—';

            switch (statKey) {
              case 'KILLS':
                value = `🔫 **${safeNum((p as any).kills)}**`;
                break;
              case 'DEATHS':
                value = `💀 **${safeNum((p as any).deaths)}**`;
                break;
              case 'SUICIDES':
                value = `☠️ **${safeNum((p as any).suicides)}**`;
                break;
              case 'LONGEST_KILL':
                value = `🎯 **${safeNum((p as any).longestKill).toFixed(1)} m**`;
                break;
              case 'LONGEST_SHOT':
                value = `🏹 **${safeNum((p as any).longestShot).toFixed(1)} m**`;
                break;
              case 'PLAYTIME':
                value = `⏳ **${fmtPlaytime(safeNum((p as any).playtime))}**`;
                break;
              case 'KILL_DEATH_RATIO':
                value = `📈 **${getKD(p).toFixed(2)} KD**`;
                break;
            }

            embed.addFields({
              name: `#${rank} ${name}`,
              value,
              inline: true,
            });
          }
        });

      return embed;
    };

    const prevId = `lb_prev_${sessionId}`;
    const nextId = `lb_next_${sessionId}`;

    const buildRow = () =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(prevId)
          .setLabel('◀ Prev')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page <= 0),
        new ButtonBuilder()
          .setCustomId(nextId)
          .setLabel('Next ▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= maxPage - 1),
      );

    const message = await interaction.editReply({
      embeds: [buildEmbed(page)],
      components: [buildRow()],
    });

    const collector = message.createMessageComponentCollector({ time: 180_000 });

    collector.on('collect', async btn => {
      if (btn.user.id !== interaction.user.id) {
        await btn.reply({ content: '❌ No es tu leaderboard', ephemeral: true });
        return;
      }

      if (btn.customId === prevId && page > 0) page--;
      if (btn.customId === nextId && page < maxPage - 1) page++;

      await btn.update({
        embeds: [buildEmbed(page)],
        components: [buildRow()],
      });
    });
  },
};
