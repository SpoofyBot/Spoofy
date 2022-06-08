const { GClient, Plugins, Command, Component } = require('gcommands');
const { Intents } = require('discord.js');
const { join } = require('path');

Component.setDefaults({
  cooldown: '1s',
  onError: (ctx, error) => {
    return ctx.reply('Oops! Something went wrong');
  },
});

const client = new GClient({
  dirs: [join(__dirname, 'commands')],
  messageSupport: false,
  messagePrefix: '!spoofy',
  devGuildId: process.env.DISCORD_DEV_SERVER,
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.login(process.env.DISCORD_TOKEN);

process.on('beforeExit', () => client.destroy());
process.on('exit', () => client.destroy());
process.on('SIGTERM', () => client.destroy());
process.on('SIGINT', () => client.destroy());
