const fs = require('fs');
const _ = require('lodash');
const Const = require('./music_constant');
const Util = require('./util');
const InstrumentRange = require('./instrument_range');
const Intro = require('./song_part/intro');
const Verse = require('./song_part/verse');
const Chorus = require('./song_part/chorus');
const Outro = require('./song_part/outro');
const Velocity = require('./velocity');

class Melody {

  /**
   * Load file from storage
   *
   * @param {Object} noteListObj - 
   * {
   *  c: [c,d,e,f...],
   *  d: [d,e,f,g...],
   * }
   */
  constructor(noteListObj) {
    this.noteListObj = noteListObj;
    this.Velocity = new Velocity();
    
  }

  findStartOctave(key, notes, start) {
    for (let i = start; i < 5; i++) {
      if (notes.indexOf(key + i) > -1) {
        return key + i;
      }
    }
    return null;
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {string} filepath The numeric MIDI pitch value to convert.
   * @param {Function} compute The numeric MIDI pitch value to convert.
   * @returns {string} The resulting symbolic note name.
   */
  compose(key, instrument, song_part, motif, chordProgressObj, chordProgressRule) {
    // console.log(InstrumentRange[instrument]);

    let all_possible_notes = this.generateAllPossibleNotes(key, instrument);

    console.log(_.chunk(all_possible_notes, 7));

    let melody_part = {};
    let velocity_part = {};


    let uniq_part = _.uniq(song_part);    

    for (let i = 0; i < uniq_part.length; i++) {
      const p = uniq_part[i];

      switch (p) {
        case 'Intro':
          melody_part[p] = new Intro(key, all_possible_notes, motif[1], chordProgressObj, chordProgressRule['Intro']);
          break;
        case 'Verse':
          let intro_motif = null;
          if (melody_part['Intro']) {
            intro_motif = melody_part['Intro'].getIntroMotif();
          }
          melody_part[p] = new Verse(key, all_possible_notes, motif[0], chordProgressObj, chordProgressRule['Verse'], intro_motif);
          break;
        case 'Chorus':
          melody_part[p] = new Chorus(key, all_possible_notes, motif[1], chordProgressObj, chordProgressRule['Chorus']);
          break;
        case 'Outro':
          let lastNote = null;          
          if (melody_part['Chorus'] != undefined) {
            lastNote = _.last(melody_part['Chorus'].getMelody().notes);            
          }
          melody_part[p] = new Outro(key, all_possible_notes, chordProgressObj, chordProgressRule['Outro'], lastNote);
          break;
        default:
          break;
      }
    }

    
    for (const part in melody_part) {
      let num = melody_part[part].getMelody().notes.length;
      velocity_part[part] = this.Velocity.generateVelocityMelody(part, num);
    }    

    let melody = {
      notes: [],
      pattern: '',
      velocity: [],
    };
    
    song_part.forEach(part => {
      melody = this.concat(
        melody,
        {
          notes: melody_part[part].getMelody().notes,
          pattern: melody_part[part].getMelody().pattern,
          velocity: velocity_part[part],
        }
      )
    });    
    
    return melody;
  }

  concat(a, b){
    let o = {};
    o.notes = _.concat(a.notes, b.notes);
    o.pattern = a.pattern + b.pattern;
    o.velocity = _.concat(a.velocity, b.velocity);
    return o;
  }

  generateAllPossibleNotes(key, instrument) {
    const note_min = InstrumentRange[instrument].min;
    const note_max = InstrumentRange[instrument].max;
    const oct_min = Util.getOctave(note_min);
    const oct_max = Util.getOctave(note_max);

    let all_possible_notes = Util.generateNoteWithOctave(
      Const.semitone,
      oct_min,
      oct_max - oct_min + 1
    );

    all_possible_notes = all_possible_notes.slice(all_possible_notes.indexOf(note_min), all_possible_notes.indexOf(note_max) + 1);

    let tmp_notes = all_possible_notes;
    all_possible_notes = all_possible_notes.slice(all_possible_notes.indexOf(this.findStartOctave(key, all_possible_notes, 4)));

    all_possible_notes = all_possible_notes.filter(note => {
      return this.noteListObj[key].indexOf(Util.getPitch(note)) >= 0;
    });

    if (all_possible_notes.length <= 8) {
      all_possible_notes = tmp_notes;
      all_possible_notes = all_possible_notes.slice(all_possible_notes.indexOf(this.findStartOctave(key, all_possible_notes, 3)));

      all_possible_notes = all_possible_notes.filter(note => {
        return this.noteListObj[key].indexOf(Util.getPitch(note)) >= 0;
      });
    }
    return all_possible_notes;
  }



}

module.exports = Melody;