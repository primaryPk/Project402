const fs = require('fs');
const _ = require('lodash');
const Const = require('../music_constant');
const Util = require('../util');
const SongPart = require('./songpart');

class Intro extends SongPart {

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
    this.intro_motif = null;
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
        if(j == 0){
          let patt = pattern[j].substr(8);
          let num_intro_motif = patt.replace(/_/g, '').length;
          let before_motif_note = 0;
          if (num_intro_motif == 2){
            before_motif_note = melody[j].slice(-3)[0]
            this.intro_motif = {
              notes: melody[j].slice(-2),
              pattern: patt
            }
          } else if (num_intro_motif > 2) {
            let match = patt.match(/x_*x_*x_*/);
            let num_half_melody = pattern[j].substr(0,8).replace(/_/g, '').length;
            before_motif_note = melody[j].slice(num_half_melody-1)[0];
            this.intro_motif = {
              notes: melody[j].slice(num_half_melody, num_half_melody + 3),
              pattern: match[0]
            }
          }
          // console.log(melody[j]);          
          this.intro_motif.notes = this.generateIntroMotifNote(before_motif_note,this.intro_motif.notes);
        }
        if (melody[j].some(e => e < 0 || e >= this.all_possible_notes.length)) {
          c--;
          j--;
          // console.log('Motif Up found -1');
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
          // console.log('Motif Down found -1');
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

  getIntroMotif(){    
    return this.intro_motif;
  }

  generateIntroMotifNote(before, notes){
    let diff = notes[0] - before;
    let motif_notes = [diff];
    for (let k = 1; k < notes.length; k++) {
      motif_notes.push(notes[k] - notes[k-1]);        
    }   
    // console.log(motif_notes);
    return motif_notes;
  }

}

module.exports = Intro;