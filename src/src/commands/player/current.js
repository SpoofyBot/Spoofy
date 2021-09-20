import spotify from '../../spotify';
import redis from '../../redis';
import spotifyUri from 'spotify-uri';
import spotifyLookup from '../../spotify-lookup';
import prettyMs from 'pretty-ms';
import progressBar from 'string-progressbar';
import { Command } from 'gcommands';
import { MessageEmbed } from 'discord.js';
import spoofy, { EmbedColors, EmbedDescriptions, formatMsg } from '../../spoofy';
import signale from 'signale';

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'current',
      cooldown: '2s',
      description: 'Get the current track being played',
    });
  }

  async run({ channel, member, guild, respond }) {
    var embed = new MessageEmbed().setColor(EmbedColors.Standard);

    var status = await spoofy.getConnectedStatus(guild);
    switch (status) {
      case spoofy.NOT_BOUND:
        embed.setColor(EmbedColors.Error);
        embed.setDescription(EmbedDescriptions.NotBound);
        await respond({ embeds: embed, ephemeral: true });
        return;
      case spoofy.ACTIVE:
      case spoofy.NOT_ACTIVE:
        embed.setColor(EmbedColors.Error);
        embed.setDescription(
          status == spoofy.NOT_ACTIVE
            ? EmbedDescriptions.NotConnected
            : EmbedDescriptions.AlreadyInUse
        );
        await respond({ embeds: embed, ephemeral: true });
        return;
      default:
        break;
    }

    await spotify.current().then(async ({ json, err }) => {
      if (err != undefined) {
        embed.setColor(EmbedColors.Error);
        embed.setDescription(formatMsg(':x:', 'Spotify request failed!'));
        signale.error(err);
        return;
      }
      await createTrackEmbed(member, embed, json);
    });

    const boundChannelId = await redis.getGuildBind(String(guild.id));
    await respond({ embeds: embed, ephemeral: boundChannelId != channel.id });
  }
};

export async function createTrackEmbed(
  embed,
  track = {
    uri: null,
    trackName: null,
    elapsed: null,
    duration: null,
    albumName: null,
    albumDate: null,
    artists: null,
    authorImageUrl: null,
  }
) {
  //var uri = trackJson['current'];
  var openUrl = spotifyUri.formatOpenURL(track.uri);
  await spotifyLookup
    .cover(track.uri)
    .then((coverUrl) => {
      //const elapsed = trackJson['trackTime'];
      //const duration = trackJson['track']['duration'];
      //const album = trackJson['track']['album']['name'];
      //var artists = [];
      //trackJson['track']['artist'].forEach((artist) => {
      //artists.push(artist['name']);
      //});

      //const dateJson = trackJson['track']['album']['date'];
      //const date = new Date(
      //dateJson['month'] + '-' + dateJson['day'] + '-' + dateJson['year']
      //);

      embed.setAuthor('Currently playing', track.authorImageUrl);
      //embed.setTitle(trackJson['track']['name']);
      embed.setTitle(track.trackName);
      embed.setURL(openUrl);
      embed.setThumbnail(coverUrl);
      embed.setDescription(track.artists.join(', '));

      if (track.elapsed != null && track.duration != null) {
        const msConf = {
          colonNotation: true,
          secondsDecimalDigits: 0,
        };
        const elapsedMs = prettyMs(track.elapsed, msConf);
        const durationMs = prettyMs(track.duration, msConf);
        const progress = progressBar.splitBar(
          track.elapsed,
          track.duration,
          14,
          '─',
          '◈'
        )[0];
        embed.addField('Elapsed', elapsedMs + '  ' + progress + '  ' + durationMs);
      }

      embed.setTimestamp(track.albumDate);
      embed.setFooter(track.albumName, coverUrl);
    })
    .catch((err) => {
      embed.setDescription(formatMsg(':x:', 'Cover art failure!'));
      signale.error(err);
    });
}

function getTrackObjectFromJson(trackJson) {
  const uri = trackJson['current'];
  const elapsed = trackJson['trackTime'];
  const duration = trackJson['track']['duration'];
  const albumName = trackJson['track']['album']['name'];
  var artists = [];
  trackJson['track']['artist'].forEach((artist) => {
    artists.push(artist['name']);
  });
  const dateJson = trackJson['track']['album']['date'];
  const date = new Date(
    dateJson['month'] + '-' + dateJson['day'] + '-' + dateJson['year']
  );

  return {};
}

/*   async run() {
    var resp;
    var current = await spotify.current(resp);

    var embed = new MessageEmbed().setColor(EmbedColors.Standard);
    if (resp.res.statusCode != 200) {
      embed.setColor(EmbedColors.Error);
      embed.setDescription(':x:  Response failed, status code: ' + resp.res.statusCode);
      await respond({ embeds: embed });
      return;
    }

    embed = embed.setDescription(
      ':x:  Response failed, status code ' + resp.res.statusCode,
    );
    await respond({ embeds: embed });
  } 
};*/

/* function createTrackEmbed(track) {
  var embed = new MessageEmbed().setColor(EmbedColors.Standard);
  embed.setImage();
} */

/**
{
    "current": "spotify:track:586rOcAzOHkpJTA4POqO2c",
    "trackTime": 181224,
    "track": {
        "gid": "A89438D03EB9471CBF926EAA03C6E540",
        "name": "Right Where It Belongs",
        "album": {
            "gid": "A7F24E410A234176821152A855E87149",
            "name": "With Teeth",
            "artist": [
                {
                    "gid": "1F4B339096C24F4E8718104B350EF29E",
                    "name": "Nine Inch Nails"
                }
            ],
            "label": "Nothing",
            "date": {
                "year": 2005,
                "month": 5,
                "day": 3
            },
            "coverGroup": {
                "image": [
                    {
                        "fileId": "AB67616D00001E02F489B4582E496DE8F71E88DA",
                        "size": "DEFAULT",
                        "width": 300,
                        "height": 300
                    },
                    {
                        "fileId": "AB67616D00004851F489B4582E496DE8F71E88DA",
                        "size": "SMALL",
                        "width": 64,
                        "height": 64
                    },
                    {
                        "fileId": "AB67616D0000B273F489B4582E496DE8F71E88DA",
                        "size": "LARGE",
                        "width": 640,
                        "height": 640
                    }
                ]
            }
        },
        "artist": [
            {
                "gid": "1F4B339096C24F4E8718104B350EF29E",
                "name": "Nine Inch Nails"
            }
        ],
        "number": 13,
        "discNumber": 1,
        "duration": 304853,
        "popularity": 42,
        "externalId": [
            {
                "type": "isrc",
                "id": "USIR10500489"
            }
        ],
        "file": [
            {
                "fileId": "1613B0E5767BBCB44EAA7F07FE9DE0E6809E92DD",
                "format": "OGG_VORBIS_320"
            },
            {
                "fileId": "3E3EEC82EBC0C3291376064FDA378B04A01BA237",
                "format": "OGG_VORBIS_160"
            },
            {
                "fileId": "FD54D3C8011B02C044B36898FFE4136C892F5A45",
                "format": "OGG_VORBIS_96"
            },
            {
                "fileId": "F5188F3CB04C5F5743EE9A0CBDAD976B7F0F4D80"
            },
            {
                "fileId": "0C67F5D9FCF7C3DBFFBC77D97DAB2F66456C9901"
            },
            {
                "fileId": "4F7F26D8AE90A6DFF7D2988DC30011F56C979DD8"
            },
            {
                "fileId": "81391FA46AA2FE37FBD8B872435894950BB55F61"
            },
            {
                "fileId": "C226E006A22111AB38595BF4354C1E999537E791",
                "format": "AAC_24"
            }
        ],
        "preview": [
            {
                "fileId": "6420C00B4AFA042AD9C2804B054F49D618892A02",
                "format": "MP3_96"
            }
        ],
        "hasLyrics": true,
        "licensor": {
            "uuid": "FE358EA987E2424D9021C2665A0667B7"
        }
    }
}
 */
