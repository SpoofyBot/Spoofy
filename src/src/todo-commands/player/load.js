import { Command } from 'gcommands';
import { EmbedColors } from '../../spoofy';
import { MessageEmbed } from 'discord.js';

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'load',
      cooldown: '2s',
      description: 'Disconnects Spoofy from the active voice channel',
    });
  }

  async run({ respond }) {
    var embed = new MessageEmbed().setColor(EmbedColors.Standard);
    await respond({ embeds: embed, ephemeral: true });
  }
};
