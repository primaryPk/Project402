const fs = require('fs');
const _ = require('lodash');
const Const = require('../config/music_constant');

const Util = {

  /**
   * Load file from storage
   *
   * @param {string} path - The numeric MIDI pitch value to convert.
   * @returns {Object} The resulting symbolic note name.
   */
  loadFile: (path) => {
    return JSON.parse(fs.readFileSync(path));
  },

  /**
   * Load file from storage
   *
   * @param {string} path - The numeric MIDI pitch value to convert.
   * @param {Object} data - The numeric MIDI pitch value to convert.
   */
  saveFile: (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data))
  },

  /**
   * Load file from storage
   *
   * @param {string} path - The numeric MIDI pitch value to convert.
   * @returns {boolean} The resulting symbolic note name.
   */
  isExists: (path) => {
    return fs.existsSync(path);
  },

  /**
   * Load file from storage
   *
   * @param {Array} arr - The numeric MIDI pitch value to convert.
   * @returns {numer} between 0 to length.
   */
  random: (arr) => {
    return Math.floor(Math.random() * arr.length);
  },

  /**
   * Load file from storage
   *
   * @param {Array} arr - The numeric MIDI pitch value to convert.
   * @returns {Any} element in array
   */
  randomElement: (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * Load file from storage
   *
   * @param {Array} arr - The numeric MIDI pitch value to convert.
   * @returns {Any} element in array
   * 
   *  arr = [c,d,e,f,g] **
   *  arr = [a,c,d,e,f]
   * 
   *  [e,c,d,f#] => [2,0,1,-1]
   *  c => 0
   */
  noteToNumber: (noteList, notes) => {
    if (Array.isArray(notes)) {
      return notes.map(note => {
        return noteList.indexOf(note);
      });
    } else {
      return noteList.indexOf(notes);
    }
  },

  /**
   * Load file from storage
   *
   * @param {Array} noteList - The numeric MIDI pitch value to convert.
   * @param {number} notes - The numeric MIDI pitch value to convert.
   * @returns {Any} element in array
   */
  numberToNote: (noteList, notes) => {
    if (Array.isArray(notes)) {
      return notes.map(note => {
        return noteList[note];
      });
    } else {
      return noteList[notes];
    }
  },

  /**
   * Load file from storage
   *
   * @param {Array} noteList - e.g. [c,e,g] 
   * @param {number} start_octave - e.g. 3
   * @param {number} repeat - e.g. 2
   * @returns {Any} element in array e.g. [c3,e3,g3,c4,e4,g4]
   */
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

  /**
   * Load file from storage
   *
   * @param {Array} noteList - e.g. [c3,e3,g3,c4] 
   * @param {string} note - e.g. g3
   * @param {number} shift - e.g. +1
   * @returns {string} element in array e.g. c4
   */
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

  /**
   * Load file from storage
   *
   * @param {Array} noteList - e.g. [c,e,g] 
   * @param {string} note - e.g. g
   * @param {number} shift - e.g. +1
   * @returns {string} element in array e.g. c
   */
  changePitchWithoutOctave: (noteList, note, shift) => {
    return noteList[(noteList.indexOf(note) + shift + noteList.length) % noteList.length];
  },

  /**
   * Load file from storage
   *
   * @param {Any} notes - e.g. f#3, [c4,c#4,e4]
   * @returns {Any} f#, [c,c#,e]
   */
  getPitch: (notes) => {
    if (Array.isArray(notes)) {
      return notes.map(note => {
        return note.slice(0, note.length - 1);
      });
    } else {
      return notes.slice(0, notes.length - 1);
    }
  },

  /**
   * Load file from storage
   *
   * @param {Any} notes - [c,d,e,f,g,a,b] // notes[0] = chord[1]
   * @param {Any} chord - [c,e,g] // always base chord
   * @returns {Any} sad
   */
  isMinorChord: (notes, chord) => {
    return chord[1] != notes[2];
  },

  /**
   * Load file from storage
   *
   * @param {Any} notes - [c,d,e,f,g,a,b] // notes[0] = chord[1]
   * @param {Any} chord - [eb,g,c]
   * @returns {Any} sdas
   */
  isMinorChordByVoicingChord: (notes, chord) => {
    return Util.noteToNumber(notes, chord).indexOf(-1) >= 0;
  },

  /**
   * Load file from storage
   *
   * @param {string} note - c3
   * @returns {number} 3
   */
  getOctave: (notes) => {
    if (Array.isArray(notes)) {
      return notes.map(note => {
        return Number(note.substr(note.length - 1));
      });
    } else {
      return Number(notes.substr(notes.length - 1));
    }
  },

  /**
   * Load file from storage
   *
   * @param {Array} noteList - [c,d,e,f,g,a,b]
   * @param {number} shift - 3
   * @param {boolean} reverse - false
   * @returns {Array} [f,g,a,b,c,d,e]
   */
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