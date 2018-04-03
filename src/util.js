const fs = require('fs');
const _ = require('lodash');
const Const = require('./music_constant');

const self = {};

self.loadFile = (path)=>{
  return JSON.parse(fs.readFileSync(path));
}

self.saveFile = (path, data) => {
  fs.writeFileSync(path, JSON.stringify(data))
}

self.isExists = (path) => {
  return fs.existsSync(path);
}

self.random = (arr) => {
  return Math.floor(Math.random() * arr.length);
}

self.randomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
}

self.noteToNumber = (noteList, notes) => {
  if (Array.isArray(notes)) {
    return notes.map(note => {
      return noteList.indexOf(note);
    });
  } else {
    return noteList.indexOf(notes);
  }
}

self.numberToNote = (noteList, notes) => {
  if (Array.isArray(notes)) {
    return notes.map(note => {
      return noteList[note];
    });
  } else {
    return noteList[notes];
  }
}

self.generateNoteWithOctave = (noteList, start, repeat) => {
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
}

self.changePitch = (noteList, note, shift) => {
  let octave = self.getOctave(note);
  let pitch = self.getPitch(note);  
  return noteList[(noteList.indexOf(pitch) + shift + noteList.length) % noteList.length] + octave;
}

self.changePitchWithoutOctave = (noteList, note, shift) => {
  return noteList[(noteList.indexOf(note) + shift + noteList.length) % noteList.length];
}

self.getPitch = (notes) => {
  if (Array.isArray(notes)) {
    return notes.map(note => {
      return note.slice(0, note.length - 1);
    });
  } else {
    return notes.slice(0, notes.length - 1);
  }
}

self.isMinorChord = (notes, chord) => {
  return chord[1] != notes[2];
}

self.isMinorChordByVoicingChord = (notes, chord) => {
  return self.noteToNumber(notes, chord).indexOf(-1) >= 0;
}

self.getOctave = (note) => {
  return Number(note.substr(note.length - 1));
}

self.rotate = (arr, n, reverse = false) => {
  if (!reverse){
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

module.exports = self;