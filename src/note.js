const fs = require('fs');
const _ = require('lodash');
const Const = require('./music_constant');
const Util = require('./util');

class Note {

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

  computeNoteMajorScale(){
    let notes = {};
    let scale = [1, 1, 0.5, 1, 1, 1, 0.5];
    Const.key.forEach(key => {
      key = key.toLowerCase();
      let start = Const.semitone.indexOf(key);
      if (start < 0) {
        key = _.invert(Const.flat_notes)[key];
        start = Const.semitone.indexOf(key);
      }
      let note = [];
      let size = Const.semitone.length;
      for (let i of scale) {
        note.push(Const.semitone[start]);
        start = (start + i * 2) % size;
      }

      notes[key] = note;
    })
    return notes
  }



}

module.exports = Note;