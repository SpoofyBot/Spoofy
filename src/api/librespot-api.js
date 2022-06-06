const purest = require('purest');

class LibrespotApi {
  constructor() {
    this.apiSpec = {
      provider: 'librespot-java',
      defaults: {
        origin: 'http://localhost:24879',
      },
      config: {
        'librespot-java': {
          // Player
          load: { method: 'post', path: 'player/load' },
          play_pause: { method: 'post', path: 'player/play-pause' },
          pause: { method: 'post', path: 'player/pause' },
          resume: { method: 'post', path: 'player/resume' },
          next: { method: 'post', path: 'player/next' },
          prev: { method: 'post', path: 'player/prev' },
          seek: { method: 'post', path: 'player/seek' },
          shuffle: { method: 'post', path: 'player/shuffle' },
          repeat: { method: 'post', path: 'player/repeat' },
          set_volume: { method: 'post', path: 'player/set-volume' },
          volume_up: { method: 'post', path: 'player/volume-up' },
          volume_down: { method: 'post', path: 'player/volume-down' },
          current: { method: 'post', path: 'player/current' },
          tracks: { method: 'post', path: 'player/tracks' },
          addToQueue: { method: 'post', path: 'player/addToQueue' },
          removeFromQueue: { method: 'post', path: 'player/removeFromQueue' },
          // Instance
          instance: { method: 'get', path: 'instance' },
          terminate: { method: 'post', path: 'instance/terminate' },
          close: { method: 'post', path: 'instance/close' },
          // Discovery
          list: { method: 'post', path: 'discovery/list' },
          // Web-api
          api_player: { method: 'get', path: 'web-api/v1/me/player' },
        },
      },
    };

    this.apiEvents = {
      // Spotify context URI changed
      contextChanged: 'contextChanged',
      // Spotify track URI changed
      trackChanged: 'trackChanged',
      // Playback has ended
      playbackEnded: 'playbackEnded',
      // Playback has been paused
      playbackPaused: 'playbackPaused',
      // Playback has been resumed
      playbackResumed: 'playbackResumed',
      // Playback volume changed
      volumeChanged: 'volumeChanged',
      // Track has been seeked
      trackSeeked: 'trackSeeked',
      // Metadata for the current track is available
      metadataAvailable: 'metadataAvailable',
      // Playback halted or resumed from halt
      playbackHaltStateChanged: 'playbackHaltStateChanged',
      // Current session is now inactive (no audio)
      inactiveSession: 'inactiveSession',
      // A network error occurred and we're trying to reconnect
      connectionDropped: 'connectionDropped',
      // Successfully reconnected
      connectionEstablished: 'connectionEstablished',
      // Entered the panic state, playback is stopped. This is usually recoverable.
      panic: 'panic',
    };

    this.api = purest(this.apiSpec);
  }

  getCurrentSong() {
    return false; //await this.api.post('/player/current').request();
  }
}

module.exports = new LibrespotApi();
