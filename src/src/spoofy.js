import path from 'path';
import signale from 'signale';
import redis from './redis';
import { readFileSync } from 'fs';
import { GCommandsClient } from 'gcommands';
import { getVoiceConnections } from '@discordjs/voice';
import { createClient } from 'redis';
import spotify from './spotify';

export const EmbedColors = {
  Standard: '#1fe9b4',
  Error: '#fc0303',
  Success: '#07fc03',
};

export const EmbedDescriptions = {
  AlreadyInUse: ":x:  I'm already being used somewhere else, sorry :(",
  AlreadyConnected: ":musical_note:  I'm already connected!",
  NotConnected: ':x:  Not currently connected to any guild',
  NotInSameVoiceChannel: ':x:  Need to be connected to the same voice channel as me',
  NotBound: ':x:  I need to be bound first!',
  RequireVoiceChannel: ':x:  You need to be in a voice channel for me to join!',
  Goodbye: ':wave:  Goodbye!',
};

export function formatMsg(emoji, msg) {
  return emoji != null ? emoji + '  ' + msg : msg;
}

export function errorEmbed(emoji, msg, embed) {
  embed.setColor(EmbedColors.Error);
  embed.setDescription(this.formatMsg(emoji, msg));
  return embed;
}

export default {
  redis: createClient({ socket: { url: 'redis://@spoofy_redis:6379' } }),
  start() {
    this.token = readFileSync('/run/secrets/discord-token', 'utf8');

    this.client = new GCommandsClient({
      intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
      cmdDir: path.join(__dirname, 'commands'),
      eventDir: path.join(__dirname, 'events'),
      caseSensitiveCommands: false, // true or false | whether to match the commands' caps
      caseSensitivePrefixes: false, // true or false | whether to match the prefix in message commands
      unkownCommandMessage: false, // true or false | send unkownCommand Message
      language: 'english', // english, spanish, portuguese, russian, german, czech, slovak, turkish, polish, indonesian, italian
      commands: {
        slash: 'slash', // https://gcommands.js.org/docs/#/docs/main/dev/typedef/GCommandsOptionsCommandsSlash
        prefix: '!spotify',
      },
      defaultCooldown: '3s',
    });

    this.client.addListener('shutdown', (err) => {
      signale.error(err);
      this.client.destroy();
      process.exit(1);
    });

    this.client.on('log', signale.info);
    if (process.env.NODE_ENV == 'development') this.client.on('debug', signale.debug); // warning | this also enables the default discord.js debug logging

    this.client.on('ready', () => {
      signale.success('Spoofy is ready!');
    });

    // Pipe spotify events to client events
    for (const event in spotify.Events) {
      spotify.on(event, (...args) => {
        this.client.emit(event, ...args);
      });
    }

    spotify.clear();

    return this.client.login(this.token);
  },

  stop(err) {
    this.client.emit('shutdown', err);
  },

  connected(connections = getVoiceConnections()) {
    return connections.size > 0;
  },

  connectedToGuild(guild, connections = getVoiceConnections()) {
    if (guild && connections.size > 0) {
      const activeConnection = connections.values().next().value;
      return activeConnection.joinConfig.guildId == guild.id;
    }
    return false;
  },

  connectedToChannel(guild, channel, connections = getVoiceConnections()) {
    if (guild && channel && connections.size > 0) {
      const activeConnection = connections.values().next().value;
      return (
        activeConnection.joinConfig.guildId == guild.id &&
        activeConnection.joinConfig.channelId == channel.id
      );
    }
    return false;
  },

  getActiveConnectedGuildId(connections = getVoiceConnections()) {
    if (connections.size > 0) {
      const activeConnection = connections.values().next().value;
      return activeConnection.joinConfig.guildId;
    }
    return null;
  },

  // Active to some degree
  ACTIVE: 'active',
  // Not active anywhere
  NOT_ACTIVE: 'not-active',
  // Not bound to a channel
  NOT_BOUND: 'not-bound',
  // Active, and in the same guild
  ACTIVE_SAME_GUILD: 'active-same-guild',
  // Active, and in the same voice channel
  ACTIVE_SAME_VOICE_CHANNEL: 'active-same-voice-channel',

  async getConnectedStatus(guild, channel = null, connections = getVoiceConnections()) {
    const bound = await redis.isGuildBound(guild.id);
    if (!bound) return this.NOT_BOUND;
    if (!this.connected(connections)) return this.NOT_ACTIVE;
    if (!this.connectedToGuild(guild, connections)) return this.ACTIVE;
    if (!channel || !this.connectedToChannel(guild, channel, connections))
      return this.ACTIVE_SAME_GUILD;
    return this.ACTIVE_SAME_VOICE_CHANNEL;
  },
};
