import PulsePlayer from '../pulsePlayer';
import { Command } from 'gcommands';
import { MessageEmbed } from 'discord.js';
import spoofy, { EmbedColors, EmbedDescriptions, formatMsg } from '../spoofy';
import { entersState, VoiceConnectionStatus, joinVoiceChannel } from '@discordjs/voice';

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      cooldown: '2s',
      description: 'Joins the users connected voice channel',
    });
  }

  async run({ member, respond }) {
    var embed = new MessageEmbed().setColor(EmbedColors.Standard);

    if (await joinVoice(member, embed)) {
      await respond({ embeds: embed, ephemeral: true });
      return;
    }

    embed.setColor(EmbedColors.Error);
    await respond({ embeds: embed, ephemeral: true });
  }
};

export async function connectToChannel(channel) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    return connection;
  } catch (error) {
    connection.destroy();
    throw error;
  }
}

export async function joinVoice(member, embed) {
  var voiceState = member.voice;
  var guild = voiceState.guild;
  var channel = voiceState.channel;

  var status = await spoofy.getConnectedStatus(guild, channel);
  switch (status) {
    case spoofy.NOT_BOUND:
      embed.setDescription(EmbedDescriptions.NotBound);
      return false;
    case spoofy.ACTIVE:
    case spoofy.ACTIVE_SAME_GUILD:
      embed.setDescription(EmbedDescriptions.AlreadyInUse);
      return false;
    case spoofy.ACTIVE_SAME_VOICE_CHANNEL:
      embed.setDescription(EmbedDescriptions.AlreadyConnected);
      break;
    default:
      break;
  }

  if (channel == null) {
    embed.setDescription(EmbedDescriptions.RequireVoiceChannel);
    return false;
  }

  if (channel) {
    const connection = await connectToChannel(channel);
    if (connection != undefined) {
      PulsePlayer.getPlayer().createCapture();
      connection.subscribe(PulsePlayer.getPlayer());
      embed.setDescription(formatMsg(':thumbsup:', 'Joined `' + channel.name + '`!'));
      return true;
    }
  }
  embed.setDescription(formatMsg(':x:', 'Failed to join the voice channel'));
  return false;
}
