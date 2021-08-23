require('module-alias/register');

const Pulse = require('pulseaudio2');
const { Client } = require('discord.js');
const prism = require('prism-media');
const fs = require('fs')
const {
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	joinVoiceChannel,
} = require('@discordjs/voice');


const maxTransmissionGap = 1000
const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Pause,
		maxMissedFrames: Math.round(maxTransmissionGap / 20),
	},
});

player.on('stateChange', (oldState, newState) => {
	if (oldState.status === AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Playing) {
		console.log('Playing audio output on audio player');
	} else if (newState.status === AudioPlayerStatus.Idle) {
		console.log('Playback has stopped. Attempting to restart.');
		attachRecorder();
	}
});

function attachRecorder() {
	const ctx = new Pulse({
		client: "spoofy",
		flags: "noflags|noautospawn|nofail" // optional connection flags (see PulseAudio documentation)
	});

	const opts = {
		channels:2,
		rate:48000,
		format:'s16le',
		flags:'adjust_latency',
		latency:100
	};

	const encoder = new prism.opus.Encoder({ frameSize: 960, channels: 2, rate: 48000 });
	const rec = ctx.createRecordStream(opts);

	rec.pipe(encoder);
	player.play(
		createAudioResource(encoder,
			{
				inputType: StreamType.Opus,
			},
		),
	);
	console.log('Attached recorder - ready to go!');
}

async function connectToChannel(channel) {
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

const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] });

client.on('ready', async () => {
	console.log('discord.js client is ready!');
	attachRecorder();
});

client.on('messageCreate', async (message) => {
	if (!message.guild) return;
	if (message.content === '-join') {
		const channel = message.member?.voice.channel;
		if (channel) {
			try {
				const connection = await connectToChannel(channel);
				connection.subscribe(player);
				await message.reply('Playing now!');
			} catch (error) {
				console.error(error);
			}
		} else {
			await message.reply('Join a voice channel then try again!');
		}
	}
});

const fs = require('fs')
var token = ""

try {
	token = fs.readFileSync('/run/secrets/discord-token', 'utf8')
} catch (err) {
  console.error(err)
}


void client.login(token);
