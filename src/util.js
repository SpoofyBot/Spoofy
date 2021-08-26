const { entersState, VoiceConnectionStatus, joinVoiceChannel, getVoiceConnections } = require('@discordjs/voice');
const signale = require('signale');

module.exports.connectToChannel = async function connectToChannel(channel) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    return connection;
  } catch (error) {
    connection.destroy();
    throw error;
  }
};

module.exports.disconnectFromChannels = async function disconnectFromChannels() {
  var connections = getVoiceConnections();
  signale.log(connections.size);
  for (var [id, conn] in connections.entries()) {
    signale.log('Disconnecting from ', id);
    conn.disconnect();
    await entersState(conn, VoiceConnectionStatus.Disconnected, 30_000);
    conn.destroy();
  }
};
