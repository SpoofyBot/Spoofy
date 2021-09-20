import redis from '../../redis';
import { Command, ArgumentType } from 'gcommands';
import { MessageEmbed } from 'discord.js';
import { EmbedColors, formatMsg } from '../../spoofy';

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'bind',
      description: 'Binds me and my spam to this channel',
      userRequiredPermissions: 'ADMINISTRATOR',
      args: [
        {
          name: 'channel',
          type: ArgumentType.CHANNEL,
          description: 'This channel will be used for my output',
          prompt: 'What channel do you want my spam in?',
          required: true,
        },
      ],
    });
  }

  async run({ client, guild, respond, args }) {
    var embed = new MessageEmbed().setColor(EmbedColors.Standard);

    const channelId = args[0];
    const channel = await client.channels.fetch(channelId);

    if (channel != null && (await redis.bindGuild(String(guild.id), channelId))) {
      embed.setColor(EmbedColors.Success);
      embed.setDescription(
        formatMsg(':thumbsup:', "I'm now bound to `" + channel.name + '`!')
      );
      await respond({ embeds: embed, ephemeral: true });
      return;
    }

    embed.setColor(EmbedColors.Error);
    embed.setDescription(formatMsg(':x:', 'Something went wrong!'));
    await respond({ embeds: embed, ephemeral: true });
  }
};
