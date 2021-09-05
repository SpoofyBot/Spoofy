import path from 'path';
import Spotify from './spotify';
import signale from 'signale';
import { readFileSync } from 'fs';
import { GCommandsClient } from 'gcommands';

var token = '';
try {
  token = readFileSync('/run/secrets/discord-token', 'utf8');
} catch (err) {
  signale.error(err);
}

//console.log('asd');

signale.config({
  displayFilename: true,
  displayTimestamp: true,
  displayDate: false,
});

var client = new GCommandsClient({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
  cmdDir: path.join(__dirname, 'commands'),
  //eventDir: 'events/',
  caseSensitiveCommands: false, // true or false | whether to match the commands' caps
  caseSensitivePrefixes: false, // true or false | whether to match the prefix in message commands
  unkownCommandMessage: false, // true or false | send unkownCommand Message
  language: 'english', // english, spanish, portuguese, russian, german, czech, slovak, turkish, polish, indonesian, italian
  commands: {
    slash: 'both', // https://gcommands.js.org/docs/#/docs/main/dev/typedef/GCommandsOptionsCommandsSlash
    context: 'both', // https://gcommands.js.org/docs/#/docs/main/dev/typedef/GCommandsOptionsCommandsContext
    prefix: '!!', // for normal commands
  },
  defaultCooldown: '3s',
});

client.on('debug', signale.debug); // warning | this also enables the default discord.js debug logging
client.on('log', signale.info);
client.on('ready', () => {
  signale.success('Spoofy is ready!');
});

client.addListener('shutdown', (err) => {
  signale.error(err);
  client.destroy();
  process.exit(1);
});

process.addListener('exit-discord', (err) => {
  client.emit('shutdown', err);
});

client.login(token);
