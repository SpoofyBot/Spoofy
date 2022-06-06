const { spawn } = require('node:child_process');

class Librespot {
  constructor() {
    this.process = null;
    this.librespotConnected = false;

    this.execPath = process.env.LIBRESPOT_PATH;
    this.execArgs = [
      '--deviceName=Spoofy',
      '--deviceType=COMPUTER',
      '--logLevel=TRACE',
      '--preferredLocale=EN',
      '--auth.strategy=USER_PASS',
      '--auth.username=' + process.env.LIBRESPOT_USERNAME,
      '--auth.password=' + process.env.LIBRESPOT_PASSWORD,
      '--cache.enabled=false',
      '--player.autoplayEnabled=false',
      '--player.output=PIPE',
      '--player.pipe=/app/librespot-out',
      '--player.preferredAudioQuality=VERY_HIGH',
    ];
  }

  // returns true if already spawned or spawns a new process, false if it fails
  connect() {
    if (this.process !== null) {
      return true;
    }

    this.process = spawn(this.execPath, this.execArgs);

    /*     this.process.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    this.process.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);
    });

    this.process.on('exit', (code) => {
      console.log(`child process exited with code ${code}`);
    }); */

    return false;
  }

  disconnect() {
    this.process = null;
    this.librespotConnected = false;
    return false;
  }

  // subscribes to an event triggered by librespot, this could run discord code, like saying something in a channel
  // when a new track has started playing
  subscribe() {
    return false;
  }

  // various api functions, getCurrentlyPlaying, getQueue, etc
  // play, etc
  /* 
    getNewDBConnection() {
      return this.databaseConnection;
    } */
}

module.exports = new Librespot();
