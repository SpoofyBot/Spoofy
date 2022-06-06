const { GClient, Plugins, Command, Component } = require('gcommands');
const { Intents } = require('discord.js');
const { join } = require('path');
const Librespot = require('./api/librespot');

// Set the default cooldown for commands
Command.setDefaults({
  cooldown: '1s',
});

// Set the default onError function for components
Component.setDefaults({
  onError: (ctx, error) => {
    return ctx.reply('Oops! Something went wrong');
  },
});

const client = new GClient({
  // Register the directories where your commands/components/listeners will be located.
  dirs: [
    join(__dirname, 'commands'),
    join(__dirname, 'components'),
    join(__dirname, 'listeners'),
  ],
  // Enable message support
  messageSupport: true,
  // Set the prefix for message commands
  messagePrefix: '!spotify ',
  // Set the guild where you will be developing your bot. This is usefull cause guild slash commands update instantly.
  devGuildId: process.env.DISCORD_DEV_SERVER,
  // Set the intents you will be using (https://discordjs.guide/popular-topics/intents.html#gateway-intents)
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Login to the discord API
client.login(process.env.DISCORD_TOKEN);

process.on('beforeExit', () => client.destroy());
process.on('exit', () => client.destroy());
process.on('SIGTERM', () => client.destroy());
process.on('SIGINT', () => client.destroy());
