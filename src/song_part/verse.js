const fs = require('fs');
const _ = require('lodash');
const Const = require('../music_constant');
const Util = require('../util');
const SongPart = require('./songpart');
const Motif = require('../motif');

class Verse extends SongPart {

  /**
   * Load file from storage
   *
   * @param {Object} all_possible_notes - 
   * {
   *  c: [c,d,e,f...],
   *  d: [d,e,f,g...],
   * }
   */
  constructor(key, all_possible_notes, motif, chordProgressObj, chordProgressRule, intro_motif) {
    super(key, all_possible_notes, motif, chordProgressObj, chordProgressRule)
    this.intro_motif = intro_motif;
    this.melody = this.composeMelody();
  }


  composeMelody() {
    // console.log(this.intro_motif);
    let melody = [];
    let pattern = [];
    let phase = this.chordProgressRule.phase / 2;
    let chords = this.getNoteListFromChord(this.chordProgressRule.chord);
    let j = 0;
    let k = 0;
    for (let i = 0; i < phase; i++) {
      for (let c = 0; c < chords.length; c++ , j++) {
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
          k++;
          if (k == 10) {            
            this.intro_motif = null;
          }
          console.log('Verse Motif Up found -1');
        }
      }
    }
    k = 0;
    for (let i = 0; i < phase; i++) {
      for (let c = 0; c < chords.length; c++ , j++) {
        let start = Util.noteToNumber(Util.getPitch(this.all_possible_notes), chords[c][0]);
        let motif = this.motif.down[0];
        melody[j] = this.findNearestMotif(this.motif.down, start, _.last(melody[j - 1]));
        pattern[j] = this.generatePattern(motif.pattern);
        this.generateMissingNote(melody[j], pattern[j], true);
        if (melody[j].some(e => e < 0 || e >= this.all_possible_notes.length)) {
          c--;
          j--;
          k++;
          if(k == 10){
            this.intro_motif = null;
          }          
          console.log('Verse Motif Down found -1');
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

  generateMissingNote(melody, pattern, reverse){
    if (!this.intro_motif) {
      super.generateMissingNote(melody, pattern);
      return;
    }
    let num_melody = melody.length;
    let total_melody = pattern.replace(/_/g, '').length;
    if (total_melody > num_melody) {
      let miss = total_melody - num_melody;
      let intro_motif_note = null;
      if(!reverse){
        intro_motif_note = this.intro_motif.notes.slice(0);
      } else {
        intro_motif_note = Motif.generateMotifDown(this.intro_motif.notes)[0];
      }
      let before_note = _.last(melody);
      intro_motif_note = this.convertStackNumberToNumber(intro_motif_note).map(e => e + before_note);
      if (miss > intro_motif_note.length){
        for (let k = 0; k < intro_motif_note.length; k++) {
          melody.push(intro_motif_note[k]);          
        }
        super.generateMissingNote(melody, pattern);
      } else {
        for (let k = 0; k < miss; k++) {
          melody.push(intro_motif_note[k]);
        }
      }
    }
  }

  // generatePattern(pattern){
  //   if (!this.intro_motif){
  //     return super.generatePattern(pattern);
  //   }
  //   if()
  //   console.log(this.intro_motif.pattern.length);
    
  //   // if (pattern.length < 8) {
  //   //   let miss = 8 - pattern.length;
  //   //   let patt = _.shuffle(Util.randomElement(this.findPatternNote(miss)));
  //   //   patt = patt.map(e => this.pattern_value[e]).join('');
  //   //   pattern += patt;
  //   // }
  //   // if (pattern.length < 16) {
  //   //   let miss = 16 - pattern.length;
  //   //   let patt = _.shuffle(Util.randomElement(this.findPatternNote(miss)));
  //   //   patt = patt.map(e => this.pattern_value[e]).join('');
  //   //   pattern += patt;
  //   // }
  //   return pattern;
  // }
}

module.exports = Verse;