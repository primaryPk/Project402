const fs = require('fs');
const header = require('waveheader');
const soundwave = require('./soundwave');
const WAV = require('./wavdata');

class Binuaralbeats {
  
  constructor(music) {
    this.music = music;

    this.FIX_FLOATING_POINT = 10e7;
    this.NumChannels = 2;
    this.SampleRate = 44100;
    this.BitsPerSample = 16;
  }

  createWavFile() {
    
    let max_amp = 0.25;
    const wav = new WAV();
    let progression = this.parseMelody(this.music.getMelody(), this.music.getTempo());
    wav.writeProgression(progression, max_amp, soundwave['violin'], true, true);
    
    progression = this.parseChord(this.music.getChordProgressionNote(), this.music.getTempo());
    wav.writeProgression(progression, max_amp, soundwave['clarinet'], true);

    let wavBuffer = wav.toBuffer();    

    let file = fs.createWriteStream('./song/test.wav');

    file.write(header(wavBuffer.length, {
      channels: 2,
      bitDepth: 16
    }))

    file.write(wavBuffer);
    file.end();    

    // var samples = []

    // var f = 698.46; // 698.46 Hertz = F4 note
    // var samples_length = 44100;
    // for (var i = 0; i < samples_length; i++) {
    //   var t = i / samples_length;
    //   var y = 0;
    //   var A_total = 0;
    //   for (var harm = 1; harm <= 7; harm++) {
    //     var f2 = f * harm;
    //     var A = 1 / harm;
    //     A_total += A;
    //     y += A * Math.sin(f2 * 2 * Math.PI * t);
    //   }
    //   samples[i] = y / A_total;
    //   samples[i] *= (1 - 0.5 * Math.sin(2 * Math.PI * 6 * t)); // Add a low frequency amplitude modulation
    //   samples[i] *= (1 - Math.exp(-t * 3));
    // }
    // samples = samples.map(el => el * 30000);
    
    // file = fs.createWriteStream('./song/test1.wav');

    // file.write(header(samples.length * 2, {
    //   channels: 1,
    //   bitDepth: 16
    // }))

    // var data = Int16Array.from(samples)
    // var buffer;

    // var size = data.length * 2 // 2 bytes per sample
    // if (Buffer.allocUnsafe) { // Node 5+
    //   buffer = Buffer.allocUnsafe(size)
    // } else {
    //   buffer = new Buffer(size)
    // }

    // data.forEach(function (value, index) {
    //   buffer.writeInt16LE(value, index * 2)
    // })

    // file.write(buffer)
    // file.end();    

  }

  parseMelody(melody, tempo) {
    let progression = [];
    let offset = 0;

    for (let note of melody) {

      let time = Number((note.duration / (tempo / 60)).toFixed(6));

      progression.push({
        note: note.pitch.toUpperCase(),
        time: time,
        amplitude: note.velocity / 128,
        offset: offset
      })

      offset = ((offset * this.FIX_FLOATING_POINT) + (time * this.FIX_FLOATING_POINT)) / this.FIX_FLOATING_POINT;
    }

     return progression;
  }

  parseChord(chord_progression, tempo) {
    let progression = [];
    let offset = 0;

    for (let chord of chord_progression) {
      let time = Number((4 / (tempo / 60)).toFixed(6));

      for (let note of chord) {


        progression.push({
          note: note.toUpperCase(),
          time: time,
          amplitude: 0.546875,
          offset: offset
        })

      }

      offset = ((offset * this.FIX_FLOATING_POINT) + (time * this.FIX_FLOATING_POINT)) / this.FIX_FLOATING_POINT;
    }
   
    return progression;
  }

}

module.exports = Binuaralbeats;