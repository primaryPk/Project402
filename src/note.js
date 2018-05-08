const fs = require('fs');
const _ = require('lodash');
const Const = require('../config/music_constant');
const Util = require('./util');

class Note {

  /**
   * Convert a numeric *********************
   * 
   * @returns {Object} The resulting note file.
   */
  generateNoteMajorScale() {
    const filepath = './storage/note.json';
    let notes = {};
    if (Util.isExists(filepath)) {
      notes = Util.loadFile(filepath);
    } else {
      notes = this.computeNoteMajorScale();
      Util.saveFile(filepath, notes);
    }
    return notes;
  }

  /**
   * Convert a numeric *********************
   * 
   * @returns {Object} The resulting note file.
   */
  computeNoteMajorScale(){
    let notes = {};
    let major_scale = [1, 1, 0.5, 1, 1, 1, 0.5]; 
    let size = Const.semitone.length;
    Const.key.forEach(key => {
      key = key.toLowerCase();
      let start = Const.semitone.indexOf(key);
      if (start < 0) {
        key = _.invert(Const.flat_notes)[key];
        start = Const.semitone.indexOf(key);
      }
      let note = [];
      for (let i of major_scale) {
        note.push(Const.semitone[start]);
        start = (start + i * 2) % size;
      }
      notes[key] = note;
    });
    return notes;
  }
}

module.exports = Note;