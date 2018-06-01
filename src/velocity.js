const _ = require('lodash');

class Velocity {

  constructor() {
    this.song_part = null;
    this.chordProgressive = null;
    this.ruleMelody = {
      Intro: { min: 80, max: 90 },
      Verse: { min: 90, max: 100 },
      Chorus: { min: 100, max: 120 },
      Outro: { min: 80, max: 90 }
    };

    this.ruleChord = { min: 50, max: 75 };
  }

  setSongpart(song_part) {
    this.song_part = song_part;
  }

  setChordProgressive(chordProgressive) {
    this.chordProgressive = chordProgressive;
  }

  generateVelocityMelody(part, num) {    
    let min = this.ruleMelody[part].min;
    let max = this.ruleMelody[part].max;
    let velocity = Array(num).fill(null).map(x => this.randomVelocity(min, max));
    return velocity;
  }

  generateVelocityChord(chords) {    
    let min = this.ruleChord.min;
    let max = this.ruleChord.max;
    chords = chords.map(chord => {
      chord.level = Array(chord.note.length).fill(0).map(v => this.randomVelocity(min, max));
      return chord;
    });
    return chords;
  }
  
  preGenerate() {
    this.len = this.song_part.map(part => {
      return this.chordProgressive[part].pattern.length * 32
    });
  }
  
  randomVelocity(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}

module.exports = Velocity;