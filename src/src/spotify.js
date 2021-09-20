import purest from 'purest';
import { Signale } from 'signale';
import spotifyUri from 'spotify-uri';
import WebSocket from 'ws';
import { signaleConfig } from './logging';

export default {
  _loggerConfig: {
    scope: 'spotify:events',
    logLevel: process.env.NODE_ENV == 'development' ? 'debug' : 'info',
  },
  _websocketUrl: 'ws://localhost:24879/events',
  _restConfig: {
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
  },

  __restClient: null,
  get _restClient() {
    if (!this.__restClient) this.__restClient = purest(this._restConfig);
    return this.__restClient;
  },

  __eventsLogger: null,
  get _eventsLogger() {
    if (!this.__eventsLogger) {
      this.__eventsLogger = new Signale(this._loggerConfig);
      this.__eventsLogger.config(signaleConfig);
    }
    return this.__eventsLogger;
  },

  __eventsSocket: null,
  get _eventsSocket() {
    if (!this.__eventsSocket) {
      this.__eventsSocket = new WebSocket(this._websocketUrl);
      this.__eventsSocket.on('message', (data) => {
        const parsed = JSON.parse(data);
        const event = parsed['event'];
        if (event != undefined) {
          this._eventsLogger.debug('[Spotify] Event emitted: ', event);
          this._eventsSocket.emit(parsed['event'], parsed);
        }
      });
    }
    return this.__eventsSocket;
  },

  Events: {
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
  },

  _parseBody(resp) {
    switch (typeof resp.body) {
      case 'string':
        return resp.body.length > 0 ? JSON.parse(resp.body) : null;
      case 'object':
        return resp.body;
      default:
        return null;
    }
  },

  async _request(endpoint, expectedStatus = 200) {
    var resp;
    try {
      resp = await this._restClient.endpoint(endpoint).request();
      if (resp.res.statusCode != expectedStatus)
        throw new Error({
          statusCode: resp.res.statusCode,
          message: resp.res.statusMessage,
          resp: resp,
        });
      var json = this._parseBody(resp);
      return { resp, json };
    } catch (err) {
      return { resp, json: null, err };
    }
  },

  async _bodyRequest(endpoint, body, expectedStatus = 200) {
    var resp;
    try {
      resp = await this._restClient.endpoint(endpoint).body(body).request();
      if (resp.res.statusCode != expectedStatus)
        throw new Error({
          statusCode: resp.res.statusCode,
          message: resp.res.statusMessage,
          resp: resp,
        });
      var json = this._parseBody(resp);
      return { resp, json };
    } catch (err) {
      return { resp, json: null, err };
    }
  },

  async _queryRequest(endpoint, query, expectedStatus = 200) {
    var resp;
    try {
      resp = await this._restClient.endpoint(endpoint).qs(query).request();
      if (resp.res.statusCode != expectedStatus)
        throw new Error({
          statusCode: resp.res.statusCode,
          message: resp.res.statusMessage,
          resp: resp,
        });
      var json = this._parseBody(resp);
      return { resp, json };
    } catch (err) {
      return { resp, json: null, err };
    }
  },

  async request(endpoint, opts = { expectedStatus: 200, body: null, query: null }) {
    var resp = await this.requestResponse(endpoint, opts);
    if (resp.err != null) throw new Error(resp.err);
    return true;
  },

  async requestResponse(
    endpoint,
    opts = { expectedStatus: 200, body: null, query: null }
  ) {
    var resp;

    if (opts.body == null && opts.query == null)
      resp = await this._request(endpoint, opts.expectedStatus);
    else if (opts.query != null)
      resp = await this._queryRequest(endpoint, opts.query, opts.expectedStatus);
    else resp = await this._bodyRequest(endpoint, opts.body, opts.expectedStatus);

    if (resp.err != null) throw new Error(resp.err);
    return resp;
  },

  async loadUrl(url) {
    const uri = spotifyUri.parse(url);
    if (uri == null) return false;
    return await this.load(uri);
  },

  async load(uri, play, shuffle = false) {
    return await this.request('load', {
      query: {
        uri: uri,
        play: play,
        shuffle: shuffle,
      },
    });
  },

  async pause() {
    return await this.request('pause');
  },

  async resume() {
    return await this.request('resume');
  },

  async next() {
    return await this.request('next');
  },

  async prev() {
    return await this.request('prev');
  },

  // enabled, disabled
  async shuffle(val) {
    return await this.request('shuffle', { query: { val: val } });
  },

  // none, track, context
  async repeat(val) {
    return await this.request('repeat', { query: { val: val } });
  },

  async current() {
    return await this.requestResponse('current');
  },

  async tracks(withQueue) {
    return await this.requestResponse('tracks', {
      query: {
        withQueue: withQueue ? 'true' : 'false',
      },
    });
  },

  async addToQueue(uri) {
    return await this.request('addToQueue', { query: { uri: uri } });
  },

  async removeFromQueue(uri) {
    return await this.request('removeFromQueue', { query: { uri: uri } });
  },

  /*   async instance() {
    return await this.requestResponse('instance');
  }, */

  // /metadata/{type}/{uri} - episode, track, album, show, artist or playlist, uri - /metadata/{uri}
  async metadata(uri, type = null) {
    return await this.requestResponse(
      type != null ? 'metadata/' + type + '/' + uri : 'metadata/' + uri
    );
  },

  async player() {
    return await this.requestResponse('api_player');
  },

  // reset the session to debug track, session will be transfered, queue will be cleared, and nothing should autoplay
  ClearTrack: 'spotify:track:4jaXxB0DJ6X4PdjMK8XVfu',
  async clear() {
    return true;
    //return await this.load(this.ClearTrack, true, false);
  },

  /* 
  async ensurePlaybackOnSession() {
    const player = await this.player();
    if (player.err != null) throw new Error(player.err);

    if (this._deviceId == null) {
      const instance = await this.instance();
      if (instance.err != null) throw new Error(instance.err);

      this._deviceId = instance.json['device_id'];
      this._deviceName = instance.json['device_name'];

      signale.info('Spotify device_id: ', this._deviceId);
      signale.info('Spotify device_name: ', this._deviceName);

      if (this._deviceId == null)
        throw new Error("librespot-java session doesn't exist!");
    }

    if (player.json['device']['id'] != this._deviceId) {
      return await this.clear();
    }

    return true;
  }, */

  // Calling load() will reset the player and it's queue to only contain whatever is loaded
  // There is always a track playing - keep this in mind when writing 'now playing stuff'

  // Load if the queue is empty and optionally start playing if the queue is empty
  // if there is a queue, add it to the end of the queue
  //async play(uri) {},

  on(event, callback) {
    this._eventsSocket.on(event, callback);
  },
};
