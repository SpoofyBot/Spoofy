const signale = require('signale');
const { opus } = require('prism-media');
const Pulse = require('pulseaudio2');
const {
  NoSubscriberBehavior,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  AudioPlayer,
} = require('@discordjs/voice');

const opts = {
  frameSize: 960,
  channels: 2,
  rate: 48000,
  format: 's16le',
  flags: 'adjust_latency',
  latency: 100,
  maxTransmissionGap: 1000,
};

module.exports = class PulsePlayer extends AudioPlayer {
  static playerInstance = null;

  constructor() {
    super(
      createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Stop,
          maxMissedFrames: Math.round(opts.maxTransmissionGap / 20),
        },
      }),
    );

    this.encoderOptions = { frameSize: opts.frameSize, channels: opts.channels, rate: opts.rate };
    this.recorderOptions = {
      channels: opts.channels,
      rate: opts.rate,
      format: opts.format,
      flags: opts.flags,
      latency: opts.latency,
    };

    this.pulse = new Pulse({ client: 'spoofy' });
    super.on('stateChange', (oldState, newState) => {
      signale.info("AudioPlayer state changed from '%s' to '%s'", oldState.status, newState.status);
      if (newState.status === AudioPlayerStatus.Idle) {
        this.destroyCapture();
      }
    });
  }

  createCapture() {
    this.encoder = new opus.Encoder(this.encoderOptions);
    this.recorder = this.pulse.createRecordStream(this.recorderOptions);

    this.recorder.pipe(this.encoder);
    super.play(createAudioResource(this.encoder, { inputType: StreamType.Opus }));
    signale.info('Pulse capture created!');
  }

  destroyCapture() {
    super.stop();
    this.encoder?.destroy();
    this.recorder?.destroy();
    signale.info('Pulse capture destroyed!');
  }

  static getPlayer() {
    if (this.playerInstance === null) {
      this.playerInstance = new this();
    }
    return this.playerInstance;
  }
};
