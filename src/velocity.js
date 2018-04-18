// const fs = require('fs');
const _ = require('lodash');
// const Const = require('./music_constant');
// const Util = require('./util');

class Velocity {

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").
   */
  constructor() {
    this.song_part = null;
    this.chordProgressive = null;
    this.ruleMelody = {
      Intro: {
        min: 80,
        max: 90
      },
      Verse: {
        min: 90,
        max: 100
      },
      // PreChorus: { min: 100, max: 110 },
      Chorus: {
        min: 100,
        max: 120
      },
      Outro: {
        min: 80,
        max: 90
      }
    };

    this.ruleChord = {
      min: 50,
      max: 75
    };
  }

  setSongpart(song_part) {
    this.song_part = song_part;
  }

  setChordProgressive(chordProgressive) {
    this.chordProgressive = chordProgressive;
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").
   * 
   * @param {number} min The numeric MIDI pitch value to convert.
   * @param {number} max The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  generateVelocityMelody(part, num) {
    
    let min = this.ruleMelody[part].min;
    let max = this.ruleMelody[part].max;
    let velocity = Array(num).fill(null).map(x => this.randomVelocity(min, max));
    return velocity;
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").
   * 
   * @param {Array} chords The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  generateVelocityChord(chords) {
    let min = this.ruleChord.min;
    let max = this.ruleChord.max;
    chords = chords.map(chord => {
      chord.level = Array(chord.note.length).fill(0).map(v => this.randomVelocity(min, max));
      return chord;
    });
    return chords;
  }
  /* [
    {note: [c3,e3,g3,c4], length: 512, level: [50,62,52,74]},
    {note: [f4,a4,c4,f5], length: 512, level: 90},
    ...
  ] */


  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").
   */
  preGenerate() {
    this.len = this.song_part.map(part => {
      return this.chordProgressive[part].pattern.length * 32
    });
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").
   * 
   * @param {number} min The numeric MIDI pitch value to convert.
   * @param {number} max The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  randomVelocity(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}

module.exports = Velocity;