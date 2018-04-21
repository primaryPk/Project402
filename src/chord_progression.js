const _ = require('lodash');
const Const = require('./music_constant');
const Util = require('./util');
const scribble = require('scribbletune');
const Chord = require('./chord');

class ChordProgression {

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").
   */
  constructor(noteListObj) {
    this.noteListObj = noteListObj;
    this.Chord = new Chord(noteListObj);
    this.simpleChord = this.Chord.getSimpleChord();
    this.voicingChord = this.Chord.getVoicingChord();
    this.wide_patterns = [
      { Intro: 0, Verse: 0, Chorus: 0, Outro: 0, },
      { Intro: 0, Verse: 0, Chorus: 1, Outro: 0, },
      { Intro: 0, Verse: 1, Chorus: 1, Outro: 0, },
      { Intro: 0, Verse: 1, Chorus: 2, Outro: 0, },
      { Intro: 0, Verse: 1, Chorus: 2, Outro: 1, },
      { Intro: 1, Verse: 1, Chorus: 1, Outro: 1, },
      { Intro: 1, Verse: 1, Chorus: 2, Outro: 1, },
    ];
  }


  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {Object} chord_progress The numeric MIDI pitch value to convert.
   * @param {Object} chords The numeric MIDI pitch value to convert.
   * @param {number} repeat The numeric MIDI pitch value to convert.
   * @returns {Array} The resulting symbolic note name.
   */
  romanToNote(chordList, key) {
    let chords = this.simpleChord[key];
    if (Array.isArray(chordList)){
      let progress = [];
      chordList.forEach(chord => {
        progress.push(chords[chord]);
      });
      return progress;
    } else {
      return chords[chordList];
    }
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {Array} notes The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  composeVoicingChord(key, song_part_list, song_part_obj, barPerPart = 1) {
    let chords = {};

    const chordList = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
    for (let i in Const.chordsName) {
      chords[Const.chordsName[i]] = this.voicingChord[this.noteListObj[key][i] + chordList[i]];
    }

    let chordProgression = [];
    let progression = {};
    let before_chord = null;
    // const wide_pattern = Util.randomElement(this.wide_patterns);
    const wide_pattern = Util.randomElement(this.wide_patterns);
    const note_octave = Util.generateNoteWithOctave(this.Chord.noteListObj[key].slice(0), 2, 6);
    // [a,b,c#,e,f#..]
    // [a3,b3,c#4,d4,e4,f#4..] <= noteList + Oct
    // [e3, ] <= chord
    // [a2,b2,c#3,d3,e3,f#3..] <= noteList + Oct
    _.uniq(song_part_list).forEach(part => {
      progression[part] = this.generateVoicingChordProgreesion(wide_pattern[part], song_part_obj[part], chords, before_chord, note_octave, barPerPart);
      before_chord = _.last(progression[part].notes); // ***
    });

    song_part_list.forEach(part => {
      chordProgression = _.concat(chordProgression, scribble.clip({
        notes: progression[part].notes,
        pattern: progression[part].pattern,
        sizzle: true
      }));
    });

    return chordProgression;
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {Array} notes The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  generateVoicingChordProgreesion(wide, chord_progress, chords, before_chord, note_octave, repeat) {
    let progress = {
      notes: [],
      pattern: this.generatePattern(chord_progress),
    };
    for (let i = 0; i < chord_progress.phase; i++) {
      chord_progress.chord.forEach(chord => {
        if (before_chord == null) {
          let current_chord = Util.randomElement(chords[chord][wide]);
          progress.notes.push(current_chord);
          before_chord = current_chord;
        } else {
          let current_chord = this.selectChordVoicing(before_chord, chord, chords, note_octave, wide);
          progress.notes.push(current_chord);
          before_chord = current_chord;
        }
      });
    }
    if (chord_progress.cadence != '') {
      let current_chord = this.selectChordVoicing(before_chord, chord_progress.cadence, chords, note_octave, wide);
      progress.notes.push(current_chord);
      before_chord = current_chord;
    }
    return progress;
  }

  selectChordVoicing(before_chord, chord, chords, note_octave, wide) {
    let before_chord_num = Util.noteToNumber(note_octave, before_chord);

    let new_chordList = _.difference(chords[chord][wide], [before_chord]); // remove dup before chord
    let new_chordList_num = new_chordList.map(chord => {
      return Util.noteToNumber(note_octave, chord);
    });

    new_chordList = new_chordList_num.filter(chord => {
      let curr_bass = chord[0];
      let curr_tenor = chord[1];
      let curr_alto = chord[2];
      let curr_soprano = chord[3];

      let befo_bass = before_chord_num[0];
      let befo_tenor = before_chord_num[1];
      let befo_alto = before_chord_num[2];
      let befo_soprano = before_chord_num[3];

      let flag = true;

      if ((befo_alto - befo_bass) % 7 == (curr_alto - curr_bass) % 7) {
        flag = false;
      }

      if ((befo_soprano - befo_bass) % 7 == (curr_soprano - curr_bass) % 7) {
        flag = false;
      }

      return flag;
    });

    if (new_chordList.length == 0) {
      new_chordList = new_chordList_num;
    }

    let before_level = this.findMedium(before_chord_num); // [0,2,4,7] => 4
    let chordList_level = new_chordList.map(chord => {
      return this.findMedium(chord);
    });

    let nearest = Infinity;
    chordList_level.forEach(lvl => {
      let diff = Math.abs(lvl - before_level);
      if (diff < nearest) nearest = diff;
    });
    let item_nearest = []
    chordList_level.forEach((lvl, i) => {
      if (before_level + nearest == lvl)
        item_nearest.push(i);
      if (before_level - nearest == lvl)
        item_nearest.push(i);
    });

    new_chordList = item_nearest.map(item => {
      return new_chordList[item];
    });

    // console.log(before_chord);
    // console.log(item_nearest);
    // console.log(chordList_level);
    // console.log(new_chordList);
    // console.log('---------------------');

    new_chordList = new_chordList.map(chord => {
      return Util.numberToNote(note_octave, chord);
    });

    return Util.randomElement(new_chordList);
  }

  /**
   * Average
   * 
   * @param {Array<number>} notes The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  findMedium(chord) {
    return ~~(_.reduce(chord, function (sum, n) {
      return sum + n;
    }, 0) / chord.length);
  }

  generatePattern(chord_progress) {
    const chord = chord_progress.chord.length;
    const phase = chord_progress.phase;
    const rhythm = chord_progress.rhythm;
    const cadence = chord_progress.cadence.length;
    const v = 'x' + '_'.repeat(16 / rhythm - 1);
    const bar = v.repeat(rhythm);
    return bar.repeat((chord * phase) + cadence);
  }

}

module.exports = ChordProgression;