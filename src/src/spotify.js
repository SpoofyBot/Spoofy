import purest from 'purest';
import signale from 'signale';
import spotifyUri from 'spotify-uri';
import WebSocket from 'ws';

export const SpotifyEvents = {
  contextChanged: 'contextChanged', // The Spotify context URI changed
  trackChanged: 'trackChanged', // The Spotify track URI changed
  playbackEnded: 'playbackEnded', // Playback has ended
  playbackPaused: 'playbackPaused', // Playback has been paused
  playbackResumed: 'playbackResumed', // Playback has been resumed
  volumeChanged: 'volumeChanged', // Playback volume changed
  trackSeeked: 'trackSeeked', // Track has been seeked
  metadataAvailable: 'metadataAvailable', // Metadata for the current track is available
  playbackHaltStateChanged: 'playbackHaltStateChanged', // Playback halted or resumed from halt
  sessionCleared: 'sessionCleared', // Current session went away (Zeroconf only)
  sessionChanged: 'sessionChanged', // Current session changed (Zeroconf only)
  inactiveSession: 'inactiveSession', // Current session is now inactive (no audio)
  connectionDropped: 'connectionDropped', // A network error occurred and we're trying to reconnect
  connectionEstablished: 'connectionEstablished', // Successfully reconnected
  panic: 'panic', // Entered the panic state, playback is stopped. This is usually recoverable.
};

export default class Spotify {
  static restConfig = {
    config: {
      'librespot-java': {
        // default method is POST
        // Player
        load: { path: '/player/load' },
        play_pause: { path: '/player/play-pause' },
        pause: { path: '/player/pause' },
        resume: { path: '/player/resume' },
        next: { path: '/player/next' },
        prev: { path: '/player/prev' },
        seek: { path: '/player/seek' },
        shuffle: { path: '/player/shuffle' },
        repeat: { path: '/player/repeat' },
        set_volume: { path: '/player/set-volume' },
        volume_up: { path: '/player/volume-up' },
        volume_down: { path: '/player/volume-down' },
        current: { path: '/player/current' },
        tracks: { path: '/player/tracks' },
        addToQueue: { path: '/player/addToQueue' },
        removeFromQueue: { path: '/player/removeFromQueue' },
        // Instance
        terminate: { path: '/instance/terminate' },
        close: { path: '/instance/close' },
        // Discovery
        list: { path: '/discovery/list' },
      },
    },
    provider: 'librespot-java',
    defaults: {
      origin: 'http://localhost:24879',
      method: 'POST',
    },
  };

  static restClient = purest(Spotify.restConfig);
  static eventsSocket = new WebSocket('ws://localhost:24879/events');

  static ParseUrl(url) {
    return spotifyUri.parse(url);
  }

  static async LoadUrl(url) {
    const uri = Spotify.ParseUrl(url);
    if (uri == null) return false;
    return await Spotify.Load(uri);
  }

  static async Load(uri) {
    const resp = await Spotify.restClient.endpoint('load').qs({ uri: uri }).request();
    if (resp.res.statusCode != 200)
      throw new Error('Status code not OK: ' + resp.res.statusCode);
    return true;
  }

  /*   static On(event, listener) {
    Spotify.eventsSocket.on();
  } */
  /*   static On(event, listener: (this, ...args[]) => void) {
    Spotify.eventsSocket.on(event, listener);
  } */

  // have a bool, change to true when the event listener is installed or whatever
  // check the bool in On, if false call on(message) on the socket, set to true, have a private onMessage callback
  // have On register new callbacks matched to events, map<string, callback>
  // might need to create interfaces
  //private static recieveEventMessage() {}
}

Spotify.eventsSocket.on('message', (data) => {
  const parsed = JSON.parse(data);
  const event = parsed['event'];
  if (event != undefined) {
    signale.info('Recieved %s', event);
  } else signale.info('Got %s', data);
});
