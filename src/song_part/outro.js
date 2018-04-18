const fs = require('fs');
const _ = require('lodash');
const Const = require('../music_constant');
const Util = require('../util');
const SongPart = require('./songpart');

class Outro extends SongPart {

  /**
   * Load file from storage
   *
   * @param {Object} all_possible_notes - 
   * {
   *  c: [c,d,e,f...],
   *  d: [d,e,f,g...],
   * }
   */
  constructor(key, all_possible_notes, chordProgressObj, chordProgressRule, lastNoteChorus) {
    super(key, all_possible_notes, null, chordProgressObj, chordProgressRule)
    this.lastNoteChorus = lastNoteChorus;
    this.melody = this.composeMelody();
  }

  composeMelody() {
    let melody = [this.all_possible_notes[0]];
    let chords = this.getNoteListFromChord(this.chordProgressRule.chord);
    const total_chords = chords.length;
    let possible_note = this.generateNoteFromChord(chords[chords.length - 1]);
    melody.unshift(possible_note[0]);
    let lastNote = melody[0];

    for (let c = total_chords - 2; c >= 2; c--) {
      possible_note = this.generateNoteFromChord(chords[c]);
      let note = this.findNearNote(possible_note, lastNote);
      melody.unshift(note);
      lastNote = note;
    }

    possible_note = this.generateNoteFromChord(chords[0]);

    let note = this.findParsingNote(lastNote, this.lastNoteChorus, possible_note);
    melody.unshift(note);

    return {
      notes: melody,
      pattern: Const.n4.repeat(total_chords)
    }
  }

  findNearNote(possible_note, lastNote) {
    if (lastNote == null) {
      return possible_note[Math.floor(Math.random() * 3)];
    } else {
      const diff = 6;
      let lastNote_num = Util.noteToNumber(this.all_possible_notes, lastNote);
      let possible_note_num = Util.noteToNumber(this.all_possible_notes, possible_note);
      let min = lastNote_num - diff;
      min = min < 0 ? 0 : min;
      let max = lastNote_num + diff;
      max = max > _.last(possible_note_num) ? _.last(possible_note_num) : max;
      let tmp_possible = possible_note_num.filter(num => {
        return num >= min && num <= max;
      });
      tmp_possible = Util.numberToNote(this.all_possible_notes, tmp_possible);
      let note = Util.randomElement(tmp_possible);
      if (tmp_possible.length == 1){
        while (note == lastNote){
          note = Util.randomElement(tmp_possible);
        }
      }
      return note;
    }
  }

  generateNoteFromChord(chord) {
    return this.all_possible_notes.filter(n => {
      if (chord.indexOf(Util.getPitch(n)) < 0) {
        return false;
      }
      return true;
    });
  }

  findParsingNote(note1, note2, possible_note) {
    if (!note1 || !note2) {
      return possible_note[Math.floor(Math.random() * 3)];
    }
    let note1_num = Util.noteToNumber(this.all_possible_notes, note1);
    let note2_num = Util.noteToNumber(this.all_possible_notes, note2);

    let max = Math.max(note1_num, note2_num);
    let min = Math.min(note1_num, note2_num);

    if (max - min > 12){
      max = min + 12;
    }

    let possible_note_num = Util.noteToNumber(this.all_possible_notes, possible_note);
    let tmp_possible = possible_note_num.filter(num => {
      return num > min && num < max;
    });    
    let note = note1;
    let i = 1;
    while (note == note1 || note == note2){
      if (tmp_possible.length > 0){
        if (typeof tmp_possible[0] == 'number'){
          tmp_possible = Util.numberToNote(this.all_possible_notes, tmp_possible);
        }
        note = Util.randomElement(tmp_possible);
        tmp_possible = [];
      } else {           
        tmp_possible = possible_note_num.filter(num => {
          return num > (min - i) && num < (max + i);
        });
        i++;
      }
    }    
    return note;      
  }
}

module.exports = Outro;