# :whale2: Spoofy

Spoofy is a Discord bot that captures local Spotify audio broadcasted from a headless Spotify client known as spotifyd, and uploads it to a Discord voice channel

Using PulseAudio in an Alpine based image, spotifyd pipes playback from Spotify to a PulseAudio sink. That sink is captured In a Node based application, encoded with opus-codec, and sent to an active voice connection with the help of discordjs

## :fox_face: Flex

- ~160Mb Alpine image
- ~80-150Mb memory overhead
- < 3000ms Spotify Audio -> Discord Voice Latency
- Low CPU Overhead (2% on a 5600x)
- Control with any Spotify player the account has access to

## :headphones: Commands

| Command     | Args                                | Description                         |
| ----------- | ----------------------------------- | ----------------------------------- |
| **join**    | -                                   | Joins voice channel of the caller   |
| **play**    | string - spotify song/playlist link | Changes the active song/track list  |
| **mute**    | -                                   | Mutes the Spotify playback          |
| **pause**   | -                                   | Pauses Spotify                      |
| **shuffle** | bool - true/false                   | Toggles shuffle                     |
| **repeat**  | string - all/one                    |                                     |
| **stop**    | -                                   | Stops and clears the Spotify queue  |
| **leave**   | -                                   | Leaves voice channel, stops Spotify |

## :clipboard: Notes

- Only one active connection is allowed at any given time, Spoofy cannot run multiple Spoify playback streams from a single Spotify account. To avoid needing insecure credential access, Spoofy is designed as a tiny container. KISS.
- This bot could break Discords ToS, use at your own discretion
- You can use a Spotify client to control Spotify, everything is reflected. Just be sure to select the Spoofy device in Spotify

# :whale: Deploying

## Requirements

- A Docker host
- [A registered Discord Application](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
  - Needs `bot` and `applications.commands` scopes
  - Use Permission integer `2184195136`
  - Example invite URL: `https://discord.com/api/oauth2/authorize?client_id=<client_id>&permissions=2184195136&scope=bot%20applications.commands`
- A Spotify account, with or without premium

## Secrets

- secrets/discord-token - [Respective Discord bot token](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
- secrets/spotify-user - Spotify account username to use
- secrets/spotify-passwd - Spotify account password to use
