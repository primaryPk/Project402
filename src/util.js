const fs = require('fs');
const _ = require('lodash');
const Const = require('../config/music_constant');

const Util = {

  loadFile: (path) => {
    return JSON.parse(fs.readFileSync(path));
  },

  saveFile: (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data))
  },

  isExists: (path) => {
    return fs.existsSync(path);
  },

  random: (arr) => {
    return Math.floor(Math.random() * arr.length);
  },

  randomElement: (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  noteToNumber: (noteList, notes) => {
    if (Array.isArray(notes)) {
      return notes.map(note => {
        return noteList.indexOf(note);
      });
    } else {
      return noteList.indexOf(notes);
    }
  },

  numberToNote: (noteList, notes) => {
    if (Array.isArray(notes)) {
      return notes.map(note => {
        return noteList[note];
      });
    } else {
      return noteList[notes];
    }
  },

  generateNoteWithOctave: (noteList, start_octave, repeat) => {
    let tmp_note = '';
    let curr_octave = start_octave;
    let notes = _.flatten(Array(repeat).fill(noteList));

    notes = notes.map(note => {
      if (tmp_note == '') {
        tmp_note = note;
        return note + start_octave;
      } else {
        if (Const.semitone.indexOf(tmp_note) > Const.semitone.indexOf(note)) {
          curr_octave++;
        }
        tmp_note = note;
        return note + curr_octave;
      }
    });
    return notes;
  },

  changePitch: (noteList, note, shift) => {
    if (shift == 0) return note;
    note = Util.noteToNumber(noteList, note);
    if (Array.isArray(note)){
      note = note.map(n => n + shift);
      note = note.map(n => noteList[n]);
    } else {
      note += shift;
      note = noteList[note];
    }
    return note;
  },

  changePitchWithoutOctave: (noteList, note, shift) => {
    return noteList[(noteList.indexOf(note) + shift + noteList.length) % noteList.length];
  },

  getPitch: (notes) => {
    if (Array.isArray(notes)) {
      return notes.map(note => {
        return note.slice(0, note.length - 1);
      });
    } else {
      return notes.slice(0, notes.length - 1);
    }
  },

  isMinorChord: (notes, chord) => {
    return chord[1] != notes[2];
  },

  isMinorChordByVoicingChord: (notes, chord) => {
    return Util.noteToNumber(notes, chord).indexOf(-1) >= 0;
  },

  getOctave: (notes) => {
    if (Array.isArray(notes)) {
      return notes.map(note => {
        return Number(note.substr(note.length - 1));
      });
    } else {
      return Number(notes.substr(notes.length - 1));
    }
  },

  rotate: (noteList, shift, reverse = false) => {
    if (!reverse) {
      for (let i = 0; i < shift; i++) {
        noteList.push(noteList.shift());
      }
    } else {
      for (let i = 0; i < shift; i++) {
        noteList.unshift(noteList.pop());
      }
    }
    return noteList;
  },

  chordToNumber(chord){
    switch(chord){
      case 'I': return 1;
      case 'ii': return 2;
      case 'iii': return 3;
      case 'IV': return 4;
      case 'V': return 5;
      case 'vi': return 6;
      case 'vii': return 7;
      default: return '';
    }
  }

};

module.exports = Util;