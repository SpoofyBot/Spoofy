import signale from 'signale';
import { createClient } from 'redis';

export default {
  _client: createClient({ socket: { url: 'redis://@spoofy_redis:6379' } }),
  guildChannelBindTag: 'guild_channel:',

  async getClient() {
    if (!this._client.isOpen) {
      this._client.on('error', (err) => signale.error(err));
      await this._client.connect();
    }
    return this._client;
  },

  async bindGuild(guildId, channelId) {
    const client = await this.getClient();
    await client.set(this.guildChannelBindTag + String(guildId), String(channelId));
    return (
      (await client.get(this.guildChannelBindTag + String(guildId))) == String(channelId)
    );
  },

  async isGuildBound(guildId) {
    const client = await this.getClient();
    return await client.exists(this.guildChannelBindTag + String(guildId));
  },

  async getGuildBind(guildId) {
    const client = await this.getClient();
    return await client.get(this.guildChannelBindTag + String(guildId));
  },

  async unbindGuild(guildId) {
    const client = await this.getClient();
    await client.del(this.guildChannelBindTag + String(guildId));
    return !(await client.exists(this.guildChannelBindTag + String(guildId)));
  },
};
