import { EmbedColors } from '../constants';
import { joinVoice } from './join';
import { MessageEmbed } from 'discord.js';
import { Command, ArgumentType } from 'gcommands';

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'play',
      description: 'Play a Spotify song or playlist',
      args: [
        {
          name: 'link',
          type: ArgumentType.STRING,
          description: 'A link to a Spotify song or playlist',
          prompt: 'What do you want to play?',
          required: true,
        },
      ],
    });
  }

  async run({ member, respond }) {
    var embed = new MessageEmbed().setColor(EmbedColors.Standard);

    if (!(await joinVoice(member, respond))) {
      embed.setColor(EmbedColors.Error);
      if (embed.description == null)
        embed.setDescription(':x:  Failed to join the voice channel');
      await respond({ embeds: embed, ephemeral: true });
      return;
    }

    await respond({
      content: 'asdasd',
      ephemeral: true,
    });
  }
};
