import { Command } from 'gcommands';
import { EmbedColors } from '../../spoofy';
import { MessageEmbed } from 'discord.js';

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'repeat',
      description: 'Toggles repeat',
      // needs args, takes 3 different mods
    });
  }

  async run({ respond }) {
    var embed = new MessageEmbed().setColor(EmbedColors.Standard);
    await respond({ embeds: embed, ephemeral: true });
  }
};
