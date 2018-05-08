const fs = require('fs');
const _ = require('lodash');
const Const = require('../config/music_constant');
const Util = require('./util');

class Motif {

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {string} str_pattern The numeric MIDI pitch value to convert.
   * @returns {string} The resulting symbolic note name.
   */
  generateMotif(motif) {
    let notes = [2, 4];
    let notes_up = [motif.notes.slice(0)];
    for (let note of notes) {
      notes_up.push( _.concat(motif.notes[0] + note, motif.notes.slice(1)));
    }

    let notes_down = Motif.generateMotifDown(motif.notes);
    let pattern = motif.pattern;
    let new_pattern = this.increaseTimeOfPattern(pattern);
    
    let motives = [
      { up: [], down: [] }, 
      { up: [], down: [] },
    ];
    motives[0].up = [];
    motives[0].down = [];
    motives[1].up = [];
    motives[1].down = [];
    for (let i = 0; i < notes_up.length; i++) {
      motives[0].up.push({ notes: notes_up[i], pattern: pattern });      
      motives[0].down.push({ notes: notes_down[i], pattern: pattern });      
      motives[1].up.push({ notes: notes_up[i], pattern: new_pattern });      
      motives[1].down.push({ notes: notes_down[i], pattern: new_pattern});   
    }
        
    return motives;
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {string} str_pattern The numeric MIDI pitch value to convert.
   * @returns {string} The resulting symbolic note name.
   */
  increaseTimeOfPattern(str_pattern) {
    let patterns = str_pattern.split('x');
    if (patterns[0] == '') {
      patterns.shift();
    }

    patterns = patterns.map(x => (x + '_').repeat(2));
    patterns = patterns.map(x => 'x' + x.substring(1));

    patterns = _.join(patterns, '');
    return patterns
  }

  static generateMotifDown(motif_notes){
    let notes = [2, 4];
    let notes_down = [motif_notes.slice(0)];
    notes_down[0] = notes_down[0].map(e => e * -1);
    for (let note of notes) {
      notes_down.push(_.concat(notes_down[0][0] + note, motif_notes.slice(1).map(e => e * -1)));
    }
    return notes_down;
  }

}

module.exports = Motif;