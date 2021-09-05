import { Command } from 'gcommands';
import { EmbedColors } from '../constants';
import { MessageEmbed } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'leave',
      description: 'Disconnects from channel',
    });
  }

  async run({ guild, respond }) {
    var embed = new MessageEmbed().setColor(EmbedColors.Standard);
    var connection = getVoiceConnection(guild.id);

    if (connection) {
      connection.disconnect();
      connection.destroy();

      embed.setDescription(':wave:  Goodbye!');
      await respond({ embeds: embed, ephemeral: true });
      return;
    }

    embed.setColor(EmbedColors.Error);
    embed.setDescription(':x:  Not in a voice channel to leave');
    await respond({ embeds: embed, ephemeral: true });
  }
};
