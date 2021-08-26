const { Command } = require('gcommands');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'play',
      description: 'Play a Spotify song or playlist',
    });
  }

  async run({ respond, author }) {
    respond(`Hello, **${author.tag}**!`);
  }
};
