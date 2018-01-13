const header = require('waveheader');
const WAV = require('./wavdata');
const fs = require('fs');

class Binuaralbeats {
  
  constructor(music) {
    this.music = music;

    this.FIX_FLOATING_POINT = 10e7;
    this.NumChannels = 2;
    this.SampleRate = 44100;
    this.BitsPerSample = 16;
  }

  midiToWav() {
    // let midBuffer = fs.readFileSync('./song/test.mid');
    // let wavBuffer1 = midiToWav(midBuffer).toBuffer();
    
    let max_amp = 0.25;
    const wav = new WAV();
    let progression = this.parseMelody(this.music.getMelody(), this.music.getTempo());
    wav.writeProgression(progression, max_amp, [0, 1], true);
    
    progression = this.parseChord(this.music.getChordProgressionNote(), this.music.getTempo());
    wav.writeProgression(progression, max_amp, [0, 1], true);

    let wavBuffer = wav.toBuffer();
    

    let file = fs.createWriteStream('./song/test.wav');

    file.write(header(wavBuffer.length, {
      channels: 2,
      bitDepth: 16
    }))

    file.write(wavBuffer);
    file.end();

    // file = fs.createWriteStream('./song/test1.wav');

    // file.write(header(wavBuffer1.length, {
    //   channels: 2,
    //   bitDepth: 16
    // }))

    // file.write(wavBuffer1);
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