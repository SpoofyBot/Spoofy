const { Command } = require('gcommands');
const PulsePlayer = require('../../audio');
const { connectToChannel } = require('../../util');
const { getVoiceConnections } = require('@discordjs/voice');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'join',
      description: 'Joins the voice channel',
      cooldown: '5s',
      category: 'Voice',
    });
  }

  async run({ member, respond }) {
    if (getVoiceConnections().size > 0) {
      // Limit to one voice connection
      await respond({
        content: 'A bot isntance is already being used! Sorry :(',
        ephemeral: true,
      });
      return;
    }

    var voiceState = member.voice;
    if (voiceState.channel === null) {
      await respond({
        content: 'You need to be in a voice channel for me to join!',
        ephemeral: true,
      });
    }

    var channel = voiceState.channel;
    if (await joinVoice(channel)) {
      await respond({
        content: 'Joined the channel',
        ephemeral: true,
      });
      return;
    }
  }
};

async function joinVoice(channel) {
  if (channel) {
    const connection = await connectToChannel(channel);

    PulsePlayer.getPlayer().createCapture();
    connection.subscribe(PulsePlayer.getPlayer());
    return true;
  }
  return false;
}

module.exports.joinVoice = joinVoice;
