const midiToWav = require('./synth-js/midi2wav');
const tone = require('tonegenerator')
const header = require('waveheader');
const fs = require('fs');

class Binuaralbeats {

  constructor() {

  }

  midiToWav() {
    let midBuffer = fs.readFileSync('./song/test.mid');
    let wavBuffer = midiToWav(midBuffer).toBuffer();


    var file = fs.createWriteStream('./song/test.wav');

    file.write(header(wavBuffer.length, {
      channels: 2,
      bitDepth: 16
    }))

    file.write(wavBuffer);
    file.end();

  }

}

module.exports = Binuaralbeats;