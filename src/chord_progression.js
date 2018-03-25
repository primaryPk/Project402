const _ = require('lodash');
// const Const = require('./music_constant');
const Util = require('./util');
const scribble = require('scribbletune');
const Chord = require('./chord');

class ChordProgression {

  constructor(notes) {
    this.Chord = new Chord(notes);
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

  composeSimpleChord(key, song_part_list, song_part_obj, barPerPart = 1) {
    let chords = this.simpleChord[key];

    let chordProgression = [];

    if (song_part_list != null) {
      let progression = {};
      _.uniq(song_part_list).forEach(part => {
        progression[part] = this.generateSimpleChordProgreesion(song_part_obj[part], chords, barPerPart);
      });
      song_part_list.forEach(part => {
        chordProgression = _.concat(chordProgression, progression[part]);
      });
    } else {
      let loop = song_part_obj.main.loop || 1
      for (let i = 0; i < loop; i++) {
        chordProgression = _.concat(chordProgression, this.generateSimpleChordProgreesion(song_part_obj.main, chords, barPerPart));
      }
    }

    return chordProgression;
  }

  generateSimpleChordProgreesion(chord_progress, chords, repeat) {
    let progress = [];
    for (let i = 0; i < repeat; i++)
      chord_progress.chordChunk.forEach(chord => {
        progress.push(chords[chord]);
      });
    return scribble.clip({
      notes: progress,
      pattern: chord_progress.pattern.repeat(repeat),
      sizzle: true
    });
  }

  composeVoicingChord(key, song_part_list, song_part_obj, barPerPart = 1) {
    const chords = this.voicingChord[key];

    let chordProgression = [];

    if (song_part_list != null) {
      let progression = {};
      let before_chord = null;
      // const wide_pattern = Util.randomElement(this.wide_patterns);
      const wide_pattern = this.wide_patterns[3];
      const note_octave = this.Chord.generateNoteWithOctave(this.Chord.noteList[key].slice(0), 3, 6);

      _.uniq(song_part_list).forEach(part => {
        progression[part] = this.generateVoicingChordProgreesion(wide_pattern[part], song_part_obj[part], chords, before_chord, note_octave, barPerPart);
        before_chord = _.last(progression[part].notes);
      });

      song_part_list.forEach(part => {
        chordProgression = _.concat(chordProgression, scribble.clip({
          notes: progression[part].notes,
          pattern: progression[part].pattern,
          sizzle: true
        }));
      });

    } else {
      let loop = song_part_obj.main.loop || 1
      for (let i = 0; i < loop; i++) {
        chordProgression = _.concat(chordProgression, this.generateVoicingChordProgreesion(part, song_part_obj.main, chords, barPerPart));
      }
    }
    return chordProgression;
  }

  generateVoicingChordProgreesion(wide, chord_progress, chords, before_chord, note_octave, repeat) {
    let progress = {
      notes: [],
      pattern: chord_progress.pattern.repeat(repeat)
    };
    // console.log(wide);

    for (let i = 0; i < repeat; i++) {
      chord_progress.chordChunk.forEach(chord => {
        // console.log(before_chord);
        if (before_chord == null) {
          let current_chord = Util.randomElement(chords[chord][wide]);
          progress.notes.push(current_chord);
          before_chord = current_chord;
        } else {
          let before_chord_num = Util.noteToNumber(note_octave, before_chord);

          let new_chordList = _.difference(chords[chord][wide], [before_chord]);
          let new_chordList_num = new_chordList.map(chord => {
            return Util.noteToNumber(note_octave, chord);
          });

          // console.log(new_chordList_num);

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

          let before_level = this.findMedium(before_chord_num);
          let chordList_level = new_chordList.map(chord => {
            return this.findMedium(chord);
          });
          // console.log(chordList_level);
          // console.log('before => ', before_level);

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
          // console.log(new_chordList);


          new_chordList = new_chordList.map(chord => {
            return Util.numberToNote(note_octave, chord);
          });

          let current_chord = Util.randomElement(new_chordList);
          progress.notes.push(current_chord);
          before_chord = current_chord;
        }
      });
    }
    return progress;
  }

  findMedium(chord) {
    let middle = ~~(_.reduce(chord, function (sum, n) {
      return sum + n;
    }, 0) / chord.length);

    return middle;
  }

}

module.exports = ChordProgression;