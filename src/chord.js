const fs = require('fs');
const _ = require('lodash');
const Const = require('../config/music_constant');
const Util = require('./util');
const Graph = require('./graph');

class Chord {

  constructor(noteListObj) {
    this.noteListObj = noteListObj;
  }

  generateChord(filepath, compute) {
    let chords = {};
    if (Util.isExists(filepath)) {
      chords = Util.loadFile(filepath);
    } else {
      chords = compute.bind(this)();
      Util.saveFile(filepath, chords);
    }
    return chords;
  }

  getSimpleChord() {
    return this.generateChord('./storage/simple_chord.json', this.computeSimpleChord);
  }

  getVoicingChord() {
    return this.generateChord('./storage/voicing_chord.json', this.computeVoicingChord);
  }

  findStartOctave(notes) {
    return (notes[0][0].toLowerCase() == 'a' || notes[0][0].toLowerCase() == 'b') ? 3 : 4;
  }

  computeSimpleChord() {
    let chords = {};
    const gap = [0, 2, 2, 3];
    for (const key in this.noteListObj) {
      chords[key] = {};
      const start = this.findStartOctave(this.noteListObj[key]);
      let notes = Util.generateNoteWithOctave(this.noteListObj[key], start, 2);
      for (let i in Const.chordsName) {
        chords[key][Const.chordsName[i]] = this.computeChord(notes, gap, i);
      }
      let decrease_oct = n => n.substring(0, n.length - 1) + (n.substr(n.length - 1) - 1);
      chords[key][Const.chordsName[5]] = chords[key][Const.chordsName[5]].map(decrease_oct);
      chords[key][Const.chordsName[6]] = chords[key][Const.chordsName[6]].map(decrease_oct);
    }

    return chords;
  }

  computeVoicingChord() {
    let chords = {};
    const gap = [0, 2, 2, 3];

    let allChords = {};
    let allVoicingChords = {};

    for (const key in this.noteListObj) {
      let notes = _.flatten(Array(2).fill(this.noteListObj[key]));
      allChords[this.noteListObj[key][0] + 'maj'] = this.computeChord(notes, gap, 0);
      allChords[this.noteListObj[key][1] + 'min'] = this.computeChord(notes, gap, 1);
      allChords[this.noteListObj[key][6] + 'dim'] = this.computeChord(notes, gap, 6);
    }

    for (const chord in allChords) {
      let type = chord.substring(chord.length - 3);
      let semitone = chord.substring(0, chord.length - 3);
      let notes_octave = null;
      let bass = '';

      switch (type) {
        case 'maj':
          notes_octave = Util.generateNoteWithOctave(this.noteListObj[semitone].slice(0), 3, 4);
          bass = notes_octave[0];
          break;
        case 'min':
          semitone = Const.semitone[(Const.semitone.indexOf(semitone) + 10) % 12];
          notes_octave = Util.generateNoteWithOctave(this.noteListObj[semitone].slice(0), 3, 5);
          bass = notes_octave[1];
          break;
        case 'dim':
          semitone = Const.semitone[(Const.semitone.indexOf(semitone) + 1) % 12];
          notes_octave = Util.generateNoteWithOctave(this.noteListObj[semitone].slice(0), 3, 5);
          bass = notes_octave[6];
          break;
        default:
          break;
      }

      let base_chords = allChords[chord];
      let base_chords_uniq = _.uniq(base_chords);
      let graph = new Graph();

      let new_vertices = [bass];
      graph.addVertex(bass);

      while (new_vertices.length != 0) {
        let vertex = new_vertices.shift();
        let start = notes_octave.indexOf(vertex);
        if (start < 0) continue;
        for (let i = start + 1; i < start + 12; i++) {
          if (i >= notes_octave.length) break;
          if (base_chords_uniq.indexOf(Util.getPitch(notes_octave[i])) >= 0) {
            graph.addVertex(notes_octave[i]);
            graph.addEdge(vertex, notes_octave[i])
            new_vertices.push(notes_octave[i]);
          }
        }
      }

      let chord_octave = Util.generateNoteWithOctave(base_chords_uniq, 3, 2);
      let all_path = [];

      chord_octave.forEach(note => {
        all_path = _.concat(all_path, graph.findAllPath(note));
      });

      all_path = this.filterChordByMusicRule(all_path, base_chords, notes_octave);
      all_path = this.filterChordByBinuaral(all_path, base_chords, notes_octave);

      allVoicingChords[chord] = this.classifiedChord(notes_octave, all_path);
    }

    return allVoicingChords;
  }

  classifiedChord(noteListObj, chords) {
    let result = [
      [],
      [],
      []
    ];
    chords.forEach(chord => {
      let chord1 = Util.noteToNumber(noteListObj, chord);
      let min = Math.min(...chord1);
      let max = Math.max(...chord1);

      if (max - min < 10) {
        result[0].push(chord)
      } else if (max - min < 15) {
        result[1].push(chord)
      } else {
        result[2].push(chord)
      }
    });
    return result;
  }

  filterChordByMusicRule(all_path, base_chords, notes_octave) {
    let base_chords_uniq = _.uniq(base_chords);
    let gap_rules_array = [12, 8, 8];
    let gap_rules = {}
    base_chords_uniq.forEach((key, i) => gap_rules[key] = gap_rules_array[i]);

    all_path = all_path.filter(path => path.length == 4);
    let count_note = _.countBy(base_chords)
    all_path = all_path.filter(path => {
      return _.isEqual(count_note, _.countBy(path, Util.getPitch));
    });

    all_path = all_path.filter(path => {
      let path_gap = [];
      let flag = true;
      for (let i = 0; i < path.length - 1; i++) {
        path_gap.push(notes_octave.indexOf(path[i + 1]) - notes_octave.indexOf(path[i]));
      }
      for (let i = 0; i < path_gap.length; i++) {
        if (path_gap[i] > gap_rules_array[i]) {
          flag = false;
          break;
        }
      }
      return flag;
    });

    return all_path;
  }

  filterChordByBinuaral(all_path, base_chords, notes_octave) {
    all_path = all_path.filter(path => {
      if (Util.getPitch(path[0]) == base_chords[1]) {
        if (Util.getPitch(path[1]) == base_chords[2]) {
          return true;
        } else if (notes_octave.indexOf(path[3]) - notes_octave.indexOf(path[0]) < 15) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    });

    all_path = all_path.filter(path => {
      if (Util.getPitch(path[0]) == base_chords[2]) {
        if (notes_octave.indexOf(path[1]) - notes_octave.indexOf(path[0]) < 12) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    });

    if (Util.isMinorChord(this.noteListObj[base_chords[0]], base_chords)) {
      all_path = all_path.filter(path => {
        let tmp_path = Util.getPitch(path);
        return tmp_path[0] == base_chords[0] &&
          tmp_path[1] == base_chords[1]
      });
    }

    return all_path;
  }

  computeChord(notes, gap, i) {
    let chord = [];
    let pos = Number(i);
    for (let j in gap) {
      pos += Number(gap[j]);
      chord.push(notes[pos]);
    }
    return chord;
  }

}

module.exports = Chord;