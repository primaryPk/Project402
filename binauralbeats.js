const tone = require('tonegenerator')
const header = require('waveheader');
const fs = require('fs');

class Binuaralbeats {

  constructor(gen) {
    this.gen = gen;
    this.tonedata
  }

  createChord(chord) {
    console.log(chord);
    
  }

  createChordProgression() {
    let chordProgression = this.gen.getChordProgressionNote();
    for (let chord of chordProgression) {
      this.createChord(chord);
    }
  }
}

module.exports = Binuaralbeats;