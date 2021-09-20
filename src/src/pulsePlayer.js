import Pulse from 'pulseaudio2';
import signale from 'signale';
import { opus } from 'prism-media';
import {
  NoSubscriberBehavior,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  AudioPlayer,
} from '@discordjs/voice';

const opts = {
  frameSize: 960,
  channels: 2,
  rate: 48000,
  format: 's16le',
  flags: 'adjust_latency',
  latency: 200,
  maxTransmissionGap: 200,
};

export default class PulsePlayer extends AudioPlayer {
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

    this.encoderOptions = {
      frameSize: opts.frameSize,
      channels: opts.channels,
      rate: opts.rate,
    };
    this.recorderOptions = {
      channels: opts.channels,
      rate: opts.rate,
      format: opts.format,
      flags: opts.flags,
      latency: opts.latency,
    };

    this.pulse = new Pulse({ client: 'spoofy' });
    this.pulse.on('error', (err) => {
      process.emit('exit-discord', err);
    });

    super.on('stateChange', (oldState, newState) => {
      signale.info(
        "AudioPlayer state changed from '%s' to '%s'",
        oldState.status,
        newState.status,
      );
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
    if (this.playerInstance == null) {
      this.playerInstance = new this();
    }
    return this.playerInstance;
  }
}
