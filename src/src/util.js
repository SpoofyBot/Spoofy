import {
  entersState,
  VoiceConnectionStatus,
  joinVoiceChannel,
  getVoiceConnections,
} from '@discordjs/voice';
import signale from 'signale';

export async function connectToChannel(channel) {
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
}

export async function disconnectFromChannels() {
  var connections = getVoiceConnections();
  signale.log(connections.size);
  for (var [id, conn] in connections.entries()) {
    signale.log('Disconnecting from ', id);
    conn.disconnect();
    await entersState(conn, VoiceConnectionStatus.Disconnected, 30_000);
    conn.destroy();
  }
}
