const fs = require('fs');
const _ = require('lodash');
const Const = require('../../config/music_constant');
const Miss = require('../../config/missing_note');
const Util = require('../util');

class SongPart {

  /**
   * Load file from storage
   *
   * @param {Object} all_possible_notes - 
   * {
   *  c: [c,d,e,f...],
   *  d: [d,e,f,g...],
   * }
   */
  constructor(key, all_possible_notes, motif, chordProgressObj, chordProgressRule) {
    this.key = key;
    this.all_possible_notes = all_possible_notes;
    this.all_possible_number = [...Array(this.all_possible_notes.length).keys()];
    this.motif = motif;
    this.chordProgressObj = chordProgressObj;
    this.chordProgressRule = chordProgressRule;
    this.pattern_value = {
      '2': Const.n05,
      '4': Const.n1,
      '8': Const.n2,
      '16': Const.n4
    };

  }

  composeMelody() {
    return { notes: null, pattern: null }
  }

  getNoteListFromChord(chord) {
    let chords = this.chordProgressObj.romanToNote(chord, this.key);
    if (Array.isArray(chords[0]))
      chords = chords.map(c => _.uniq(Util.getPitch(c)));
    else {      
      chords = _.uniq(Util.getPitch(chords));
    }
    return chords;
  }

  findNearestMotif(motif, start, before_note) {
    let tmp_motif = motif.map(e => {
      return this.convertStackNumberToNumber(e.notes).map(x => x + start);
    });
    for (let i = 0; i < 3; i++) {
      tmp_motif.push(tmp_motif[i].map(e=> e+7));      
    }
    tmp_motif = tmp_motif.filter(m => {
      return Util.numberToNote(this.all_possible_notes, m).every(e => {
        return e != undefined;
      })
    })
    // console.log(before_note);
    // console.log(tmp_motif.map(e => Util.numberToNote(this.all_possible_notes, e)));
    // console.log('===============');
    
    let diff = _.flatten(tmp_motif.map(e => {
      let d = Math.abs(e[0] - before_note);
      return d == 0 ? Infinity : d;
    }));

    let min = Math.min(...diff);
    let arr = [];
    
    for (let k = 0; k < diff.length; k++) {
      if (diff[k] == min) {
        arr.push(tmp_motif[k]);
      }
    }

    return Util.randomElement(arr);
  }

  generateMissingNote(melody, pattern) {
    let num_melody = melody.length;
    let total_melody = pattern.replace(/_/g, '').length;
    if (total_melody > num_melody) {
      let miss = total_melody - num_melody;
      for (let k = 0; k < miss; k++) {
        let last_note = _.last(melody);
        let new_note = this.selectNextNote(last_note, -1);
        melody.push(new_note);
      }
    }
  }

  generatePattern(pattern) {
    if (pattern.length < 8) {
      let miss = 8 - pattern.length;
      let patt = _.shuffle(Util.randomElement(this.findPatternNote(miss)));
      patt = patt.map(e => this.pattern_value[e]).join('');
      pattern += patt;
    }
    if (pattern.length < 16) {
      let miss = 16 - pattern.length;
      let patt = _.shuffle(Util.randomElement(this.findPatternNote(miss)));
      patt = patt.map(e => this.pattern_value[e]).join('');
      pattern += patt;
    }
    return pattern;
  }

  selectNextNote(before_note, reverse = 1) {
    let weight = this.getWeight(before_note);
    weight = this.convertStackNumberToNumber(weight);
    weight = this.fixedFloatingPoint(weight);
    let rand = Math.random();
    let new_note = 0;
    let size = weight.length;
    for (let i = size - 1; i >= 0; i--) {
      if (weight[i] < rand) {
        new_note = i + 1;
        break;
      }
    }
    return new_note;
  }

  fixedFloatingPoint(weight) {
    let max = Math.max(...weight);
    return weight.map(e => {
      let num = e;
      if (e == max) {
        e = 1;
      } else {
        e = +e.toFixed(3);
      }
      return e;
    });
  }

  convertStackNumberToNumber(arr) {
    let stack = arr.slice(0);
    let curr = stack[0];
    for (let i = 1; i < stack.length; i++) {
      stack[i] = Number(curr) + Number(stack[i]);
      curr = stack[i];
    }
    return stack;
  }

  getWeight(note, reverse = 1) {
    let size = this.all_possible_number.length;
    let weight = this.all_possible_number.map((e, i) => {
      let diff = Math.abs(e - note);
      let weight = 1 / diff;
      if (weight == Infinity) {
        weight = 0.2;
      }
      weight *= ((size + (i * reverse)) / size);
      if (diff >= 5) {
        weight = 0;
      }
      return weight;
    });

    let sum_weight = _.reduce(weight, function (sum, n) {
      return sum + n;
    }, 0);
    weight = weight.map(e => {
      return Number((e / sum_weight).toFixed(3));
    });
    return weight;
  }

  generateNoteCadence(pattern, melody, j){
    if (this.chordProgressRule.cadence.length > 0) {
      let before_note = _.last(melody[j - 1])
      let chord = this.getNoteListFromChord(this.chordProgressRule.cadence);
      let octs = Util.getOctave(this.all_possible_notes);      
      let min = Math.min(...octs);
      let max = Math.max(...octs);
      let possible_new_note = Util.generateNoteWithOctave(chord, min, max - min + 1);
      possible_new_note = possible_new_note.filter(note => {
        return this.all_possible_notes.indexOf(note) >= 0;
      });
      let possible_new_note_num = Util.noteToNumber(this.all_possible_notes, possible_new_note);
      let diff = possible_new_note_num.map(n => Math.abs(n - before_note))
      let min_diff = Math.min(...diff);
      let arr = [];
      for (let i = 0; i < diff.length; i++) {
        if (diff[i] == min_diff){
          arr.push(possible_new_note_num[i])
        }        
      }
      // console.log(this.chordProgressRule.cadence);
      // console.log(possible_new_note);
      // console.log(diff);
      // console.log(_.last(melody[j - 1]));

      melody[j] = [Util.randomElement(arr)];
      pattern[j] = Const.n4;
    }
  }

  getMelody(){
    return this.melody;
  }

  findPatternNote(miss) {
    if (miss % 2 == 1) {
      console.error('Error! note haas a semiquaver.');
      return null;
    }
    return Miss[miss];
  }

}

module.exports = SongPart;