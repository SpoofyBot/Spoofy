const {
  entersState,
  VoiceConnectionStatus,
  joinVoiceChannel,
  getVoiceConnections,
} = require('@discordjs/voice');

class Voice {
  constructor() {
    this.voiceStates = {
      // Not active anywhere
      NOT_ACTIVE: 'not-active',

      // Active somewhere that doesn't fall into the bottom two
      ACTIVE: 'active',

      // Active, and in the same guild
      ACTIVE_GUILD: 'active-guild',

      // Active, and in the same voice channel
      ACTIVE_VOICE_CHANNEL: 'active-voice-channel',
    };
  }

  getStatusByMember(member) {
    var connections = getVoiceConnections();

    if (connections.size > 0) {
      var voiceState = member.voice;
      var guild = voiceState.guild;
      var channel = voiceState.channel;
      var ac = connections.values().next().value;
      if (
        channel &&
        ac.joinConfig.guildId == guild.id &&
        ac.joinConfig.channelId == channel.id
      ) {
        return this.voiceStates.ACTIVE_VOICE_CHANNEL;
      }

      if (ac.joinConfig.guildId == guild.id) {
        return this.voiceStates.ACTIVE_GUILD;
      }

      return this.voiceStates.ACTIVE;
    }

    return this.voiceStates.NOT_ACTIVE;
  }

  connectToChannel(channel) {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    try {
      entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      return connection;
    } catch (error) {
      connection.destroy();
      throw error;
    }
  }

  connectToMemberChannel(member) {
    var status = this.getStatusByMember(member);
    var channel = member.voice.channel;

    if (channel == null) {
      //embed.setDescription(EmbedDescriptions.RequireVoiceChannel);
      return false;
    }

    if (channel) {
      const connection = this.connectToChannel(channel);
      if (connection != undefined) {
        //PulsePlayer.getPlayer().createCapture();
        //connection.subscribe(PulsePlayer.getPlayer());
        //embed.setDescription(formatMsg(':thumbsup:', 'Joined `' + channel.name + '`!'));
        return true;
      }
    }
    //embed.setDescription(formatMsg(':x:', 'Failed to join the voice channel'));
    return false;
  }
}

module.exports = new Voice();
