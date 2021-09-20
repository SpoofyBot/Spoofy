import redis from '../../redis';
import { Command } from 'gcommands';
import { MessageEmbed } from 'discord.js';
import { EmbedColors, formatMsg } from '../../spoofy';

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'unbind',
      description: 'Unbinds me',
      userRequiredPermissions: 'ADMINISTRATOR',
    });
  }

  async run({ guild, respond }) {
    var embed = new MessageEmbed().setColor(EmbedColors.Standard);

    if (await redis.unbindGuild(guild.id)) {
      embed.setColor(EmbedColors.Success);
      embed.setDescription(formatMsg(':thumbsup:', 'Spoofy is now unbound!'));
      await respond({ embeds: embed, ephemeral: true });
      return;
    }

    embed.setColor(EmbedColors.Error);
    embed.setDescription(formatMsg(':x:', 'Something went wrong!'));
    await respond({ embeds: embed, ephemeral: true });
  }
};
