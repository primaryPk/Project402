const fs = require('fs');
const _ = require('lodash');
const Const = require('./music_constant');

module.exports.loadFile = (path)=>{
  return JSON.parse(fs.readFileSync(path));
}

module.exports.saveFile = (path, data) => {
  fs.writeFileSync(path, JSON.stringify(data))
}

module.exports.isExists = (path) => {
  return fs.existsSync(path);
}

module.exports.random = (arr) => {
  return Math.floor(Math.random() * arr.length);
}

module.exports.randomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports.noteToNumber = (noteList, notes) => {
  if (Array.isArray(notes)) {
    return notes.map(note => {
      return noteList.indexOf(note);
    });
  } else {
    return noteList.indexOf(notes);
  }
}

module.exports.numberToNote = (noteList, notes) => {
  if (Array.isArray(notes)) {
    return notes.map(note => {
      return noteList[note];
    });
  } else {
    return noteList[notes];
  }
}
