// require the needed discord.js classes
const { Client, Intents } = require("discord.js");
const { RtAudio, RtAudioFormat } = require("audify");
const { PulseAudio, PA_SAMPLE_FORMAT, sampleSize } = require("pulseaudio.js");
const Pulse = require("pulseaudio2")
const WavWriter = require('wav').FileWriter;
const fs = require('fs');

// create a new Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once("ready", () => {
  console.log("Ready!");
});

client.login("ODc3MjQwNTk4MDc4MzE2NjU0.YRvv-A.Yq2N6GWecN7PUiNFhjZ1NZRpLjs");



async function main() {
    const ctx = new Pulse({
        client: 'test-client',
    });

    const opts = {
        channels:2,
        rate:44100,
        format:'s16le',
        latency:50
    };

    const rec = ctx.createRecordStream(opts);
	const encoder = new prism.opus.Encoder({ channels: 2, rate: 44100 });
    rec.pipe(encoder);


    process.on('SIGINT', () => {
        rec.end();
        out.end();
        ctx.end();
    });
}

main();
