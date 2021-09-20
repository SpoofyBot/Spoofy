import { Command } from 'gcommands';
import { MessageEmbed } from 'discord.js';
import spoofy, { EmbedColors, EmbedDescriptions, formatMsg } from '../spoofy';
import { getVoiceConnections } from '@discordjs/voice';

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      cooldown: '2s',
      description: 'Leaves the active voice channel',
    });
  }

  async run({ member, respond }) {
    var embed = new MessageEmbed().setColor(EmbedColors.Success);

    if (await disconnectVoice(member, embed)) {
      await respond({ embeds: embed, ephemeral: true });
      return;
    }

    embed.setColor(EmbedColors.Error);
    await respond({ embeds: embed, ephemeral: true });
  }
};

export function disconnectVoiceConnections() {
  const connections = getVoiceConnections();
  if (connections.size == 0) return true;

  connections.forEach((value) => {
    value.destroy();
  });
  return true;
}

export async function disconnectVoice(member, embed) {
  var voiceState = member.voice;
  var guild = voiceState.guild;
  var channel = voiceState.channel;

  var status = await spoofy.getConnectedStatus(guild, channel);
  switch (status) {
    case spoofy.NOT_BOUND:
      embed.setDescription(EmbedDescriptions.NotBound);
      return false;
    case spoofy.NOT_ACTIVE:
      embed.setDescription(EmbedDescriptions.NotConnected);
      return false;
    case spoofy.ACTIVE:
      embed.setDescription(EmbedDescriptions.AlreadyInUse);
      return false;
    case spoofy.ACTIVE_SAME_GUILD:
      embed.setDescription(EmbedDescriptions.NotInSameVoiceChannel);
      return false;
    default:
      break;
  }

  if (disconnectVoiceConnections()) {
    embed.setDescription(EmbedDescriptions.Goodbye);
    return true;
  }

  embed.setDescription(formatMsg(':x:', 'Failed to disconnect'));
  return false;
}
