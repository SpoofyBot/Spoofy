import { Command } from 'gcommands';
//import signale from 'signale';
import PulsePlayer from '../pulsePlayer';
import { EmbedColors } from '../constants';
import { MessageEmbed } from 'discord.js';
import { connectToChannel } from '../util';
import { getVoiceConnections } from '@discordjs/voice';

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'join',
      description: 'Joins the voice channel',
      cooldown: '5s',
      category: 'Voice',
    });
  }

  async run({ member, respond }) {
    var embed = new MessageEmbed().setColor(EmbedColors.Standard);

    if (await joinVoice(member, embed)) {
      await respond({ embeds: embed, ephemeral: true });
      return;
    }

    embed.setColor(EmbedColors.Error);
    if (embed.description == null) embed.setDescription(':x:  Failed to join');
    await respond({ embeds: embed, ephemeral: true });
  }
};

export async function joinVoice(member, embed) {
  var voiceState = member.voice;
  var channel = voiceState.channel;
  var channels = getVoiceConnections();

  if (channels.size > 0) {
    var activeChannel = channels.values().next().value;

    if (activeChannel.joinConfig.channelId == channel.id) {
      embed.setDescription(":musical_note: I'm already connected!");
      return true;
    }
    // Limit to one voice connection
    embed.setDescription(':x:  A bot isntance is already being used! Sorry :(');
    return false;
  }

  if (channel == null) {
    embed.setDescription(':x:  You need to be in a voice channel for me to join!');
    return false;
  }

  if (channel) {
    const connection = await connectToChannel(channel);

    PulsePlayer.getPlayer().createCapture();
    connection.subscribe(PulsePlayer.getPlayer());
    embed.setDescription(':thumbsup:  Joined `' + channel.name + '`!');
    return true;
  }
  return false;
}
