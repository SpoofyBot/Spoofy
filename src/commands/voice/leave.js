/* const signale = require('signale'); */
const { Command } = require('gcommands');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'leave',
      description: 'Disconnects from channel',
    });
  }

  async run({ guild, respond }) {
    var connection = getVoiceConnection(guild.id);
    if (connection) {
      connection.disconnect();
      connection.destroy();

      await respond({
        content: 'Bye bye!',
        ephemeral: true,
      });
      return;
    }
    await respond({
      content: 'Not in a voice a channel!',
      ephemeral: true,
    });
  }
};
