import spotify from '../../spotify';
import redis from '../../redis';
import spoofy, { EmbedColors } from '../../spoofy';
import { Event } from 'gcommands';
import { MessageEmbed } from 'discord.js';

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: spotify.Events.trackChanged,
      once: false,
      ws: false,
    });
  }

  async run(client, data) {
    if (data['uri'] == spotify.ClearTrack) return; // track changed to our clear track, which we don't care to print

    const guildId = spoofy.getActiveConnectedGuildId();
    if (guildId != null) {
      const channelId = await redis.getGuildBind(guildId);
      const channel = await client.channels.fetch(channelId);

      if (channel != null) {
        var embed = new MessageEmbed().setColor(EmbedColors.Standard);
        embed.setDescription(data['uri']);
        await channel.send(embed);
      }
    }
  }
};
