const signale = require('signale');
const SpotifyWebApi = require('spotify-web-api-node');
const { readFileSync } = require('fs');

module.exports = class Spotify {
  static spotifyApiInstance = null;

  static getApi() {
    if (this.spotifyApiInstance === null) {
      var accessToken = '';
      try {
        accessToken = readFileSync('/run/secrets/spotify-token', 'utf8');
      } catch (err) {
        signale.error(err);
        throw err;
      }

      this.spotifyApiInstance = new SpotifyWebApi({ accessToken: accessToken });
    }
    return this.spotifyApiInstance;
  }
};
