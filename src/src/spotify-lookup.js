import util from 'util';
import axios from 'axios';
import cheerio from 'cheerio';
import spotifyUri from 'spotify-uri';

var spotifyLookup = (module.exports = {});

// Spotify data urls
spotifyLookup.url = {
  ws: 'http://ws.spotify.com/lookup/1/.json?uri=%s',
  playlist: 'https://embed.spotify.com/?uri=spotify:user:%s:playlist:%s',
  cover: 'https://embed.spotify.com/oembed/?url=%s',
};

// Available cover sizes
spotifyLookup.coverSize = {
  TINY: 60,
  SMALL: 120,
  NORMAL: 300,
  MEDIUM: 300,
  LARGE: 640,
  BIG: 640,
  COVER: 'cover', // size=300 with spotify icon in bottom right
};

/**
 * Lookup a spotify uri. Supports track, album, artist, playlist.
 * @param  {String}   uri Spotify URI to lookup
 * @param  {Function} cb  Callback
 */
spotifyLookup.lookup = function (uri, extras, cb) {
  var parsed = typeof uri === 'string' ? spotifyUri.parse(uri) : uri;

  // Playlist
  if (parsed.type === 'playlist') {
    spotifyLookup.playlist(
      parsed.user,
      parsed.id,
      typeof extras === 'function' ? extras : cb,
    );
  }
  // Everything else
  else {
    var fun = spotifyLookup[parsed.type];
    if (fun) fun(parsed.id, extras, cb);
    else cb(new Error('Unknown type'));
  }
};

/**
 * Connects to ws.spotify.com/lookup
 * @param  {String|Object} uri URI string or object from parsed URI.
 * @param  {Function} cb
 * @return {String}        JSON response from spotify
 */
spotifyLookup.ws = async function (uri, cb) {
  if (typeof uri !== 'string') uri = spotifyUri.formatURI(uri);

  try {
    var resp = await axios.get(util.format(spotifyLookup.url.ws, uri));
    if (resp.status != 200) return cb(resp.status);

    var parsed = JSON.parse(resp.data);
    cb(null, parsed);
    return parsed;
  } catch (error) {
    return cb(error);
  }
};

/**
 * Gets the URL of the album art for any spotify URI.
 * @param  {String|Object} uri  URI string or object from parsed URI.
 * @param  {String|Number} size Size of the cover. see the Spotify.coverSize object for available sizes.
 * @return {String}        Cover URL
 */
spotifyLookup.cover = async function (uri) {
  if (typeof uri !== 'string') uri = spotifyUri.formatURI(uri);

  var resp = await axios.get(util.format(spotifyLookup.url.cover, uri));
  if (resp.status != 200) throw new Error(resp.status);

  return resp.data['thumbnail_url'];
};

// Add Spotify.<endpoint>, Spotify.<endpoint>.cover and Spotify.<endpoint>.flatten,
// where endpoint is track, album and artist.
// eg: Spotify.track(); Spotify.artist.cover(); Spotify.album.flatten();
['track', 'album', 'artist'].forEach(function (endpoint, i, endpoints) {
  spotifyLookup[endpoint] = function (uri, extras, cb) {
    if (typeof extras === 'function') {
      cb = extras;
      extras = false;
    }

    uri = spotifyUri.formatURI({ type: endpoint, id: uri });

    if (extras && i > 0) uri = [uri, '&extras=', endpoints[i - 1]].join('');

    spotifyLookup.ws(uri, cb);
  };

  spotifyLookup[endpoint].cover = function (uri, size, cb) {
    spotifyLookup.cover({ type: endpoint, id: uri }, size, cb);
  };

  spotifyLookup[endpoint].flatten = function (uri, cb) {
    spotifyLookup.flatten({ type: endpoint, id: uri }, cb);
  };
});

///////////////////////////////
// MORE ADVANCED STUFF BELOW //
///////////////////////////////

/**
 * Get tracks in a playlist. Same format as an album
 * @param  {String}   user User/creator of this playlist
 * @param  {String}   id   ID of the playlist
 * @param  {Function}      cb
 * @return {Array}         Array of tracks in playlist
 */
spotifyLookup.playlist = async function (user, id, cb) {
  try {
    var resp = await axios.get(util.format(spotifyLookup.url.playlist, user, id));
    if (resp.status != 200) return cb(resp.status);

    var tracks = [];

    var $ = cheerio.load(resp.data);

    $('li[rel="track"]').each(function (i, el) {
      el = $(el);
      var track = {
        href: spotifyUri.formatURI({ type: 'track', id: el.attr('data-track') }),
        duration: parseInt(el.attr('data-duration-ms')),
        cover: el.attr('data-ca'),
        artists: [],
      };

      track.name = el
        .find('li.track-title')
        .attr('rel')
        .replace(/^\d*\. /, '');

      el.find('li.artist').each(function (i, artistel) {
        artistel = $(artistel);
        track.artists.push({
          href: spotifyUri.formatURI({
            type: 'artist',
            id: artistel.attr('class').match(/[\w]{22}/)[0],
          }),
          name: artistel.attr('rel'),
        });
      });

      tracks.push(track);
    });

    var playlist = {
      playlist: {
        // spotify-uri supports parsing of playlist, but not formating -.-
        'playlist-id': ['spotify', 'user', user, 'playlist', id].join(':'),
        title: $('div.title-content').text(),
        tracks: tracks,
      },
      info: {
        type: 'playlist',
      },
    };

    cb(null, playlist);
    return playlist;
  } catch (error) {
    return cb(error);
  }
};

spotifyLookup.playlist.cover = function (user, id, cb) {
  // spotify-uri supports parsing of playlist, but not formating -.-
  var uri = ['spotify', 'user', user, 'playlist', id].join(':');
  spotifyLookup.cover(uri, cb);
};

spotifyLookup.playlist.flatten = function (user, id, cb) {
  // spotify-uri supports parsing of playlist, but not formating -.-
  var uri = ['spotify', 'user', user, 'playlist', id].join(':');
  spotifyLookup.flatten(uri, cb);
};

/**
 * Flattens an URI to tracks. Ie. an album returns all tracks in the album. an artist returns all tracks by the artist.
 * @param  {String}   uri Spotify URI to flatten
 * @param  {Function} cb
 * @return {Array}        Array of tracks
 * @todo Arists queries return a lot of duplicate albums (for different territories). Need to extract duplicates somehow.
 * @todo Make it possible to stream the result. We do many requests which can take a while.
 */
spotifyLookup.flatten = function (uri, cb) {
  if (Array.isArray(uri)) return spotifyLookup.flattenList(uri, cb);

  spotifyLookup.lookup(uri, true, function (err, res) {
    if (err) return cb(err);
    if (res.info.type === 'track') {
      cb(null, [res.track]);
    } else if (res.info.type === 'album') {
      // Add album info to every track
      var album = res.album.tracks.map(function (track, i) {
        track.album = {
          href: res.album.href,
          released: res.album.released,
          name: res.album.name,
        };

        track['track-number'] = i + 1;

        // Expecting that every track in the album has the same availability. Not sure if this is true.
        track.availability = res.album.availability;

        return track;
      });

      cb(null, album);
    } else if (res.info.type === 'playlist') {
      cb(null, res.playlist.tracks);
    } else if (res.info.type === 'artist') {
      var albums = [];
      res.artist.albums.forEach(function (album) {
        albums.push(album.album.href);
      });

      spotifyLookup.flattenList(albums, cb);
    }
  });
};

/**
 * Same as .flatten, but takes in an array if URIs
 * @param  {Array}    uris URIs to flatten
 * @param  {Function} cb
 * @return {Array}         Array of tracks
 */
spotifyLookup.flattenList = function (uris, cb) {
  var remaining = uris.length;

  // Array of track UIDs
  var tracks = [];
  var error = null;

  var done = function () {
    if (tracks.length === 0) cb(error ? error : new Error('No tracks'));
    cb(null, tracks);
  };

  uris.forEach(function (uri) {
    spotifyLookup.flatten(uri, function (err, res) {
      if (!err) tracks = tracks.concat(res);
      else error = err;
      if (--remaining <= 0) done();
    });
  });
};

export default spotifyLookup;
