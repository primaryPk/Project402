const fs = require('fs');
const _ = require('lodash');
const Const = require('../music_constant');
const Util = require('../util');
const SongPart = require('./songpart');

class Chorus extends SongPart {

  /**
   * Load file from storage
   *
   * @param {Object} all_possible_notes - 
   * {
   *  c: [c,d,e,f...],
   *  d: [d,e,f,g...],
   * }
   */
  constructor(key, all_possible_notes, motif, chordProgressObj, chordProgressRule) {
    super(key, all_possible_notes, motif, chordProgressObj, chordProgressRule)
    this.melody = this.composeMelody();
  }

  composeMelody() {
    let melody = [];
    let pattern = [];
    let phase = this.chordProgressRule.phase / 2;
    let chords = this.getNoteListFromChord(this.chordProgressRule.chord);
    let j = 0;
    for (let i = 0; i < phase; i++) {
      for (let c = 0; c < chords.length; c++, j++) {
        let motif = Util.randomElement(this.motif.up);
        let start = Util.noteToNumber(Util.getPitch(this.all_possible_notes), chords[c][0]);
        if (j == 0) {
          melody[j] = this.convertStackNumberToNumber(motif.notes).map(e => e + start);          
        } else {
          melody[j] = this.findNearestMotif(this.motif.up, start, _.last(melody[j - 1]));
        }        
        pattern[j] = this.generatePattern(motif.pattern);
        this.generateMissingNote(melody[j], pattern[j]);
        if (melody[j].some(e => e < 0 || e >= this.all_possible_notes.length)) {
          c--;
          j--;
          console.log('Motif Up found -1');
        }
      }
    }
    for (let i = 0; i < phase; i++) {
      for (let c = 0; c < chords.length; c++, j++) {        
        let start = Util.noteToNumber(Util.getPitch(this.all_possible_notes), chords[c][0]);
        let motif = this.motif.down[0];
        melody[j] = this.findNearestMotif(this.motif.down, start, _.last(melody[j - 1]));
        pattern[j] = this.generatePattern(motif.pattern);
        this.generateMissingNote(melody[j], pattern[j]);
        if (melody[j].some(e => e < 0 || e >= this.all_possible_notes.length)) {
          c--;
          j--;
          console.log('Motif Down found -1');
        }
      }
    }
    this.generateNoteCadence(pattern, melody, j);

    // console.log(melody);
    // console.log(melody.map(e => Util.numberToNote(this.all_possible_notes, e)));
    // console.log(pattern);
    return {
      notes: Util.numberToNote(this.all_possible_notes, _.flatten(melody)),
      pattern: pattern.join('')
    }
  }

}

module.exports = Chorus;