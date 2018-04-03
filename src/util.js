const fs = require('fs');
const _ = require('lodash');
const Const = require('./music_constant');

const Util = {

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4"). * 
   *
   * @param {string} path - The numeric MIDI pitch value to convert.
   * @returns {Object} The resulting symbolic note name.
   */
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

  generateNoteWithOctave: (noteList, start, repeat) => {
    let tmp_note = '';
    let octave = start;
    let notes = _.flatten(Array(repeat).fill(noteList));

    notes = notes.map(note => {
      if (tmp_note == '') {
        tmp_note = note;
        return note + start;
      } else {
        if (Const.semitone.indexOf(tmp_note) > Const.semitone.indexOf(note)) {
          octave++;
        }
        tmp_note = note;
        return note + octave;
      }
    });
    return notes;
  },

  changePitch: (noteList, note, shift) => {
    let octave = Util.getOctave(note);
    let pitch = Util.getPitch(note);
    return noteList[(noteList.indexOf(pitch) + shift + noteList.length) % noteList.length] + octave;
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

  getOctave: (note) => {
    return Number(note.substr(note.length - 1));
  },

  rotate: (arr, n, reverse = false) => {
    if (!reverse) {
      for (let i = 0; i < n; i++) {
        arr.push(arr.shift());
      }
    } else {
      for (let i = 0; i < n; i++) {
        arr.unshift(arr.pop());
      }
    }
    return arr;
  }

};

module.exports = Util;