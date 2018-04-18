const _ = require('lodash');
const scribble = require('scribbletune');
const Engine = require('json-rules-engine').Engine;
const rule = require('./music_rules');
const Const = require('./music_constant');
const Note = require('./note');
const ChordProgression = require('./chord_progression');
const Melody = require('./melody');
const Motif = require('./motif');
const Velocity = require('./velocity');
const Util = require('./util');

class MusicGenerator {

  constructor() {
    this.melody = [];
    this.simpleChordProgression = null;

    this.scale = [1, 1, 0.5, 1, 1, 1, 0.5];

    this.initRule();
    this.initEngine();

    this.Note = new Note().generateNoteMajorScale();
    this.ChordProgression = new ChordProgression(this.Note);
    this.Melody = new Melody(this.Note);
    this.Velocity = new Velocity();
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4"). 
   */
  init() {
    this.tempo = this.initAnything(this.tempos);
    this.key = this.initAnything(this.keySig).toLowerCase();
    this.instMelody = this.initAnything(this.instMelodyList);
    this.instChord = this.initAnything(this.instChordList);
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").
   * 
   * @param {number} min The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  initAnything(anything) {
    if (Array.isArray(anything)) {
      return Util.randomElement(anything);
    } else if (typeof anything == 'object') {
      return Math.floor(Math.random() * (anything.max - anything.min + 1)) + anything.min;
    } else {
      return anything;
    }
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").
   * 
   * @param {number} min The numeric MIDI pitch value to convert.
   * @param {number} max The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  initRule() {
    let me = this;
    this.initializeRule = {
      conditions: rule.init,
      event: {
        type: 'Initialize'
      },
      priority: 10,
      onSuccess: function (event, almanac) {
        me.tempos = me.facts.init.Tempo;
        me.instMelodyList = me.facts.init.InstrumentMelody;
        me.instChordList = me.facts.init.InstrumentChord;
        me.keySig = me.facts.init.KeySignature;

        almanac.addRuntimeFact('initSuccess', true)
      },
      onFailure: function (event, almanac) {
        almanac.addRuntimeFact('initSuccess', false)
      }
    }

    this.songPartRule = {
      conditions: rule.songPart,
      event: {
        type: 'Song Part'
      },
      priority: 9,
      onSuccess: function (event, almanac) {
        me.song_part = me.facts.songPart.pattern[0];
        me.Velocity.setSongpart(me.song_part);
        me.barPerPart = me.facts.songPart.TotalBarPerPart;
      },
      onFailure: function (event, almanac) {
        me.song_part = null;
        me.barPerPart = me.facts.songPart.TotalBarPerPart || 1;
      }
    };

    this.chordProgressiveRule = {
      conditions: rule.chordProgressive,
      event: {
        type: 'Chord progressive'
      },
      priority: 8,
      onSuccess: function (event, almanac) {
        me.chordProgressive = me.facts.chordProgressive;
        me.Velocity.setChordProgressive(me.chordProgressive);
        almanac.addRuntimeFact('chordSuccess', true)
      },
      onFailure: function (event, almanac) {
        almanac.addRuntimeFact('chordSuccess', false)
      }
    }

    this.melodyRule = {
      conditions: rule.molody,
      event: {
        type: 'Melody'
      },
      priority: 5,
      onSuccess: function (event, almanac) {
        if (me.facts.melody.lastBar.pattern) {
          me.lastbar = Util.randomElement(me.facts.melody.lastBar.pattern);
        }
        me.motif = new Motif().generateMotif(me.facts.melody.motif[1]);
        
        me.tick = me.facts.melody.tick;
        // me.note_in_chord = me.facts.melody.note_in_chord;
        me.note_in_chord = [1, 0, 1, 0];
        me.passingtone = true;
      },
      onFailure: function (event, almanac) {

      }
    }
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").
   * 
   * @param {number} min The numeric MIDI pitch value to convert.
   * @param {number} max The numeric MIDI pitch value to convert.
   * @returns {number} The resulting symbolic note name.
   */
  initEngine() {
    this.engine = new Engine()
    this.engine.addOperator('allContains', (facts_value, rule_value) => {
      return (typeof facts_value == 'string') ? (rule_value.indexOf(facts_value) >= 0) : (_.difference(facts_value, rule_value).length === 0);
    })
    this.engine.addOperator('arr2D_allContains', (facts_value, rule_value) => {
      if (Array.isArray(facts_value)) {
        let flag = true;
        facts_value.forEach(arr => {
          let isContain = _.difference(arr, rule_value).length === 0;
          if (!isContain)
            flag = false;
        });
        return flag;
      }
      return false;
    })
    this.engine.addOperator('between', (facts_value, rule_value) => {
      if (typeof facts_value === 'number') {
        return facts_value >= rule_value.min && facts_value <= rule_value.max;
      } else if (Array.isArray(facts_value)) {
        return facts_value.every(value => value >= rule_value.min && value <= rule_value.max);
      } else {
        return facts_value.min >= rule_value.min && facts_value.max <= rule_value.max;
      }
    })
    this.engine.addOperator('equal_length', (facts_value, rule_value) => {
      if (Array.isArray(facts_value)) {
        return facts_value.length == rule_value;
      }
      return false;
    })
    this.engine.addOperator('isStringArrayOrString', (facts_value, rule_value) => {
      let flag = true;
      if (Array.isArray(facts_value)) {
        facts_value.forEach(el => {
          if (typeof el != 'string') {
            flag = false;
          }
        });
        return flag;
      }
      return typeof facts_value == 'string';
    })

    this.engine.addRule(this.initializeRule);
    this.engine.addRule(this.songPartRule);
    this.engine.addRule(this.chordProgressiveRule);
    this.engine.addRule(this.melodyRule);

    this.engine
      .on('success', (event, almanac) => {
        console.log(event.type + " success.");
      })
      .on('failure', event => {
        console.log(event.type + " failure.");
      })
  }

  runEngine(facts) {
    facts = facts || this.facts;
    return this.engine.run(facts)
  }

  setFacts(facts) {
    this.facts = facts;
  }

  composeMelody() {
    let melody = this.Melody.compose(this.key, this.instMelody, this.song_part, this.motif, this.ChordProgression, this.chordProgressive);
    

    this.melody = scribble.clip({
      notes: melody.notes,
      pattern: melody.pattern
    });

    for (let i = 0; i < melody.velocity.length; i++) {
      this.melody[i].level = [melody.velocity[i]];
    }
    
    
    // console.log(_.chunk(melody.velocity, 10));
    

    // console.log(this.melody);
    
    
    // this.melody = this.Velocity.generateVelocityMelody(this.melody);
    
    // let notes = this.Note[this.key];
    // let melodies = [];
    // let pattern = '';
    // let me = this;
    // if (this.simpleChordProgression) {
    //   let chordPerNote = [];
    //   let octave = 6;
    //   this.simpleChordProgression.forEach((chord, idx, arr) => {
    //     let motif = Util.randomElement(me.motif.up);
    //     let motif1 = Util.randomElement(me.motif.down);
    //     let new_pattern = motif.pattern || '';
        
    //     let motif_down_pos_str = Math.abs(~~(Math.random() * (16 - new_pattern.length - motif.pattern.length) + new_pattern.length));
    //     let tick = me.findTickFromLength(chord.length);
    //     if (idx == 0) {
    //       if (new_pattern == '') {
    //         new_pattern = 'x';
    //       }
    //     }
    //     if (!(idx >= arr.length - 1 && me.lastbar)) {
    //       for (let i = 0; i < tick; i++) {
    //         new_pattern += (Math.random() > 0.85) ? 'x' : '_';
    //       }
    //     }
    //     new_pattern = (idx >= arr.length - 1 && me.lastbar) ? me.lastbar : new_pattern.slice(0, motif_down_pos_str) + motif1.pattern + new_pattern.slice(motif_down_pos_str)
    //     new_pattern = new_pattern.substring(0, tick);
    //     let new_notes = new_pattern.replace(/_/g, '').length;
    //     let notes_before_motif_down = new_pattern.slice(0, motif_down_pos_str).replace(/_/g, '').length;
    //     let expected_note = Util.generateNoteWithOctave(chord.note, octave, 1);
    //     // let octave = Number(chord.note[0][chord.note[0].length - 1]) + 2;
    //     let m = motif.notes[0];
    //     let c = 0;
    //     let melody = expected_note[0][0];
    //     let l = (motif.notes.length < new_notes) ? motif.notes.length : new_notes;
    //     let mld = [];
    //     let o = octave
    //     for (let i = 0; i < l; i++) {
    //       m = motif.notes[c++];
    //       let n = notes.indexOf(melody) + m;
    //       // o = (n > notes.length) ? o + 1 : 
    //       //     (n < 0) ? o - 1 : o;
    //       o = (n > notes.length) ? o + 1 : o;
    //       n = (n < 0) ? n + notes.length : n;
    //       melody = notes[n % notes.length];
    //       mld.push(melody + o);
    //     }
    //     l = Math.abs(notes_before_motif_down - motif.notes.length);
    //     for (let i = 0; i < l; i++) {
    //       mld.push(Util.randomElement(expected_note));
    //     }
    //     c = 0;
    //     l = (motif1.notes.length < new_notes - motif.notes.length) ? motif1.notes.length : new_notes - motif.notes.length;
    //     melody = expected_note[0][0];
    //     o = octave;
    //     for (let i = 0; i < l; i++) {
    //       m = motif1.notes[c++];
    //       let n = notes.indexOf(melody) + m;
    //       o = (n > notes.length) ? o + 1 : o;
    //       n = (n < 0) ? n + notes.length : n;
    //       melody = notes[n % notes.length];
    //       mld.push(melody + o);
    //     }
    //     l = new_notes - motif1.notes.length - motif.notes.length;
    //     for (let i = 0; i < l; i++) {
    //       mld.push(Util.randomElement(expected_note));
    //     }
    //     mld = mld.slice(0, new_notes);
    //     melodies = _.concat(melodies, mld);
    //     pattern += new_pattern;
    //   });

    //   let bars = {};
    //   let melodies1 = melodies.slice();
    //   bars.pattern = pattern.match(/.{1,16}/g);
    //   bars.notes = [];
    //   bars.pattern.forEach(patt => {
    //     let chunk = patt.replace(/_/g, '').length;
    //     bars.notes.push(melodies1.splice(0, chunk));
    //   });

      
      
    //   this.tick = [1, 0, 1, 0];
    //   if (this.tick) {
    //     for (let i = 0; i < bars.pattern.length; i++) {
    //       this.tick.forEach((t, j) => {
    //         let add = Math.random() < t;
    //         if (bars.pattern[i].charAt(j * 4) == '_' && add) {
    //           bars.pattern[i] = this.replaceAt(bars.pattern[i], j * 4, 'a');
    //         }
    //       });
          
    //       let new_patt = bars.pattern[i].replace(/_/g, '');
    //       let start = 0;
    //       let n = 0;
    //       while (n >= 0) {
    //         n = new_patt.substr(start).search('a');
    //         start = start + n + 1;
    //         if (n >= 0) {
    //           bars.notes[i].splice(start - 1, 0, bars.notes[i][start - 2]);
    //         }
    //       }
    //     }
        
    //   }
    //   bars.pattern = bars.pattern.map(patt => patt.replace(/a/g, 'x'))
      
    //   // console.log(bars);
      
      
    //   // console.log(bars.pattern);
    //   let patt = bars.pattern.join('');
    //   let new_patt = '';
    //   let seek = 0;
    //   // console.log(patt);

    //   // console.log(this.simpleChordProgression);

    //   for (const progress of this.simpleChordProgression) {
    //     let size = progress.length / 32;
    //     let pattx = patt.substr(seek, size);
    //     seek += size;
    //     // console.log(pattx);
    //     if (pattx.search(/^xx/) == -1) {
    //       new_patt += pattx
    //       continue;
    //     }
    //     if (pattx.search(/^xxx/) == 0) {
    //       new_patt += pattx
    //       continue;
    //     }
    //     // console.log('---------------------');

    //     let hold = pattx.split('x').filter(e => e != '')[0];
    //     // console.log(hold);
    //     let half = '_'.repeat(~~(hold.length / 2));
    //     half = 'x' + half
    //     if (hold.length % 2 == 1)
    //       half += '_' + half
    //     else
    //       half += half
    //     // console.log(half);

    //     pattx = half + pattx.substring(half.length)
    //     // console.log(pattx);
    //     // console.log('---------------------');       
    //     new_patt += pattx;
    //   };

    //   bars.pattern = _.chunk(new_patt, 16).map(e => e.join(''))
    //   // console.log(bars.pattern);


    //   if (this.passingtone) {
    //     let chordProgression = [];
    //     let chord_temp = [];
    //     let length = 0;
    //     this.simpleChordProgression.forEach(progress => {
    //       length += progress.length;
    //       chord_temp.push({
    //         note: progress.note,
    //         length: progress.length / 32
    //       });
    //       if (length >= 512) {
    //         length = 0;
    //         chordProgression.push(chord_temp)
    //         chord_temp = [];
    //       }
    //     });
    //     // console.log(chordProgression);

    //     this.all_posible_note = [];
    //     let tmp_note = '';
    //     let tmp_oct = octave - 1;
    //     for (let i = 0; i < 3; i++) {
    //       notes.forEach(n => {
    //         if (tmp_note == '') {
    //           tmp_note = n;
    //           this.all_posible_note.push(n + tmp_oct);
    //         } else {
    //           if (Const.semitone.indexOf(tmp_note) > Const.semitone.indexOf(n)) {
    //             tmp_oct++;
    //           }
    //           tmp_note = n;
    //           this.all_posible_note.push(n + (tmp_oct));
    //         }
    //       });
    //     }
    //     // console.log(this.all_posible_note);
    //     // console.log('--------------------------------------');

    //     // console.log(_.chunk(_.flattenDeep(bars.notes), 6));

    //     for (let i = 0; i < chordProgression.length; i++) {
    //       let seek = 0;
    //       let patt_chunk = [];
    //       let chord_of_note = [];
    //       let pitch_pos = [];
    //       let rythm_pos = [];
    //       let cache_note = _.fill(Array(4), false);
    //       let pitch_gap = [0];
    //       chordProgression[i].forEach(chord => {
    //         patt_chunk.push(bars.pattern[i].substr(seek, chord.length));
    //         seek += chord.length;
    //       });
    //       // console.log('---------------------------------');
    //       patt_chunk.forEach((patt, ichord) => {
    //         let count_note = patt.replace(/_/g, '').length;
    //         chord_of_note.push(_.fill(Array(count_note), chordProgression[i][ichord].note));
    //       });
    //       chord_of_note = _.flattenDeep(chord_of_note);
    //       chord_of_note = this.increaseOctave(chord_of_note)
    //       chord_of_note = _.chunk(chord_of_note, 4);

    //       bars.pattern[i].split('').forEach((ch, i) => {
    //         if (ch == 'x') {
    //           rythm_pos.push(i);
    //         }
    //       });
    //       // console.log(bars.notes[i]);

    //       // this.note_in_chord = [1,0,1,0]
    //       this.note_in_chord.forEach((n, m) => {
    //         let k = rythm_pos.indexOf(4 * m);
    //         if (k != -1 && Math.random() <= n) {
    //           let note = bars.notes[i][k];
    //           if (chord_of_note[k].indexOf(note) == -1) {
    //             let actual_note = me.all_posible_note.indexOf(note);
    //             let expected_note = Util.noteToNumber(this.all_posible_note, chord_of_note[k])

    //             // console.log('act1 => ' + actual_note);
    //             // console.log('expt => ' + expected_note);
    //             if (actual_note >= _.last(expected_note)) {
    //               actual_note = _.last(expected_note);
    //             } else {
    //               let cur = expected_note[0];
    //               for (let e of expected_note) {
    //                 if (Math.abs(e - actual_note) < Math.abs(e - cur))
    //                   cur = actual_note;
    //               }
    //               actual_note = cur;
    //             }
    //             // console.log('act2 => ' + actual_note);
    //             // console.log('act2 => ' + this.all_posible_note[actual_note]);

    //             bars.notes[i][k] = this.all_posible_note[actual_note];
    //           }
    //           cache_note[m] = bars.notes[i][k];
    //         }
    //       });

    //       // console.log(bars.pattern[i]);
    //       // console.log(bars.notes[i]);

    //       _.fill(Array(3)).forEach(a => {
    //         pitch_pos = [];
    //         pitch_gap = [];

    //         for (let j = 0; j < bars.notes[i].length; j++) {
    //           pitch_pos.push(this.all_posible_note.indexOf(bars.notes[i][j]));
    //         }

    //         for (let j = 0; j < pitch_pos.length - 1; j++) {
    //           pitch_gap.push(pitch_pos[j + 1] - pitch_pos[j]);
    //         }
    //         for (let j = 1; j < pitch_gap.length; j++) {
    //           if (pitch_gap[j] < -7) {
    //             pitch_pos[j] -= 7;
    //           } else if (pitch_gap[j] < -3) {
    //             pitch_pos[j] -= 3;
    //           }
    //           if (pitch_gap[j] > 7) {
    //             pitch_pos[j] += 7;
    //           } else if (pitch_gap[j] > 3) {
    //             pitch_pos[j] += 3;
    //           }
    //           bars.notes[i][j] = this.all_posible_note[pitch_pos[j]];
    //         }
    //       });
    //       // console.log(bars.notes[i]);

    //       pitch_pos = [];
    //       for (let j = 0; j < bars.notes[i].length; j++) {
    //         pitch_pos.push(this.all_posible_note.indexOf(bars.notes[i][j]));
    //       }

    //       let max_pos = Math.max(...pitch_pos);
    //       let min_pos = Math.min(...pitch_pos);
    //       // console.log(pitch_pos);
    //       // console.log(max_pos);
    //       // console.log(min_pos);

    //       if (max_pos - min_pos >= 5) {
    //         let middle = this.findMedium(bars.pattern[i], bars.notes[i]);

    //         let middle_gap = [];
    //         for (let j = 0; j < pitch_pos.length; j++) {
    //           middle_gap.push(pitch_pos[j] - middle);
    //         }

    //         for (let j = 0; j < middle_gap.length; j++) {
    //           if (middle_gap[j] > 4) {
    //             pitch_pos[j] -= 4;
    //           } else if (middle_gap[j] < -4) {
    //             pitch_pos[j] += 4;
    //           } else if (middle_gap[j] > 2) {
    //             pitch_pos[j] -= 2;
    //           } else if (middle_gap[j] < -2) {
    //             pitch_pos[j] += 2;
    //           }
    //           bars.notes[i][j] = this.all_posible_note[pitch_pos[j]];
    //         }

    //         // console.log('mid => ' + middle);
    //         // console.log(middle_gap);
    //       }

    //       bars.notes[i] = this.passingToneInBar(bars.notes[i])

    //       // console.log(chordProgression[i]);
    //       // console.log(bars.notes[i]);
    //       // console.log(chord_of_note);
    //       // console.log(cache_note);
    //       // console.log(rythm_pos);
    //       // console.log('---------------------------------');
    //     }
    //     // console.log('---------------------------------');
    //     // console.log('---------------------------------');
    //     // console.log('---------------------------------');
    //     // console.log('---------------------------------');

    //     let fixed_bug_count = 0;
    //     let fixed_bug_start = 1;
    //     LoopA: while (1) {
    //       let i = fixed_bug_start;
    //       LoopB: for (; i < bars.notes.length - 1; i++) {
    //         let mid_prev = this.findMedium(bars.pattern[i - 1], bars.notes[i - 1]);
    //         let mid_curr = this.findMedium(bars.pattern[i], bars.notes[i]);
    //         let mid_next = this.findMedium(bars.pattern[i + 1], bars.notes[i + 1]);
    //         let possible_note = chordProgression[i][0].note;
    //         possible_note = [
    //           this.increaseOctave(possible_note, 1),
    //           this.increaseOctave(possible_note, 2),
    //           this.increaseOctave(possible_note, 3),
    //         ];
    //         possible_note = _.flattenDeep(possible_note);
    //         // console.log('possible_note');
    //         // console.log(possible_note);
    //         possible_note = Util.noteToNumber(this.all_posible_note, possible_note).filter(n => n <= 15);
    //         // console.log(possible_note);

    //         let first_note = bars.notes[i][0];
    //         // console.log('first_note');
    //         // console.log(first_note);
    //         first_note = this.all_posible_note.indexOf(first_note);
    //         // console.log(first_note);

    //         // console.log(mid_prev + ' > ' + mid_curr + ' > ' + mid_next);

    //         if (mid_curr > 15) {
    //           // console.log(bars.notes[i]);
    //           bars.notes[i] = this.moveBarUpDown(first_note, bars.notes[i], bars.pattern[i], possible_note, 12, false);
    //           // console.log(bars.notes[i]);
    //           // console.log('mmmmmmmmmmmmmmmmmmmmmmmm');
    //           break LoopB;
    //         } else if (mid_prev == mid_next) {
    //           if (mid_curr - 2 > mid_next) { // 10 13 10
    //             // console.log(bars.notes[i]);
    //             bars.notes[i] = this.moveBarUpDown(first_note, bars.notes[i], bars.pattern[i], possible_note, mid_prev, false);
    //             // console.log(bars.notes[i]);
    //             // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    //             break LoopB;
    //           } else if (mid_curr + 2 < mid_next) { // 10 7 10
    //             // console.log(bars.notes[i]);
    //             bars.notes[i] = this.moveBarUpDown(first_note, bars.notes[i], bars.pattern[i], possible_note, mid_prev, true);
    //             // console.log(bars.notes[i]);
    //             // console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    //             break LoopB;
    //           }
    //         } else if (mid_curr + 3 < mid_prev) {
    //           // console.log(bars.notes[i]);
    //           bars.notes[i] = this.moveBarUpDown(first_note, bars.notes[i], bars.pattern[i], possible_note, mid_prev, true);
    //           // console.log(bars.notes[i]);
    //           // console.log('cccccccccccccccccccccccccccccc');
    //           break LoopB;
    //         } else if (mid_curr + 3 < mid_next) {
    //           // console.log(bars.notes[i]);
    //           bars.notes[i] = this.moveBarUpDown(first_note, bars.notes[i], bars.pattern[i], possible_note, mid_next, true);
    //           // console.log(bars.notes[i]);
    //           // console.log('dddddddddddddddddddddddddddddd');
    //           break LoopB;
    //         }

    //         if (i >= bars.notes.length - 2) {
    //           break LoopA;
    //         }
    //         // console.log('---------------------------------');            
    //       }

    //       fixed_bug_count++;
    //       if (fixed_bug_count > bars.notes.length * 2) {
    //         fixed_bug_count = 0;
    //         fixed_bug_start = i + 1;
    //       }
    //     }

    //     // console.log('*******************************');

    //     let notes_half_bar = [];
    //     // let patts_half_bar = [];
    //     for (let i = 0; i < bars.notes.length; i++) {
    //       let p1 = bars.pattern[i].substr(0, bars.pattern[i].length / 2);
    //       // patts_half_bar.push(p1);
    //       // patts_half_bar.push(bars.pattern[i].substr(bars.pattern[i].length / 2));

    //       let c1 = p1.replace(/_/g, '').length;

    //       notes_half_bar.push(_.slice(bars.notes[i], 0, c1));
    //       notes_half_bar.push(_.slice(bars.notes[i], c1));
    //     }
    //     // console.log(notes_half_bar); 
    //     let tmp_head = _.head(notes_half_bar);
    //     let tmp_last = _.last(notes_half_bar);
    //     // console.log(tmp_head);
    //     // console.log(tmp_last);

    //     // patts_half_bar = _.initial(_.tail(patts_half_bar));
    //     notes_half_bar = _.initial(_.tail(notes_half_bar));

    //     // notes_half_bar = notes_half_bar.map(notes => notes.map(n => this.all_posible_note.indexOf(n))) 
    //     // patts_half_bar = _.chunk(patts_half_bar, 2);
    //     notes_half_bar = _.chunk(notes_half_bar, 2);
    //     // console.log(notes_half_bar);
    //     // console.log(_.chunk(_.flattenDeep(bars.notes), 8));
    //     for (let i = 0; i < notes_half_bar.length; i++) {
    //       let note1 = Util.noteToNumber(this.all_posible_note, [_.last(notes_half_bar[i][0])])[0];
    //       let note2 = Util.noteToNumber(this.all_posible_note, notes_half_bar[i][1])[0];
    //       // console.log(note1 + ' > ' + note2);

    //       let diff = ~~(Math.abs(note1 - note2) / 2);
    //       // console.log('diff : ' + diff);   
    //       // console.log(notes_half_bar[i]);
    //       // if (i > 0) {
    //       //   console.log(notes_half_bar[i-1]);            
    //       // }

    //       if (notes_half_bar[i][0].length == 1) {
    //         // console.log('== 1');            
    //         if (i > 0) {
    //           let note3 = notes_half_bar[i - 1][1];
    //           if (note3.length != 1) {
    //             note3 = [_.last(_.initial(note3))];
    //           }
    //           note3 = Util.noteToNumber(this.all_posible_note, note3)[0];
    //           diff = ~~(Math.abs(note3 - note2) / 2);
    //           // console.log(note3 + ' > ' + note1 + ' > ' + note2);
    //         }
    //         if (note1 - note2 > 1) {
    //           notes_half_bar[i][0][0] = this.all_posible_note[note2 + diff];

    //           // console.log(' > 1 = ' + diff);

    //         } else if (note1 - note2 < -1) {
    //           notes_half_bar[i][0][0] = this.all_posible_note[note2 - diff];
    //           // console.log(' < -1 = ' + diff);
    //         }
    //       } else {
    //         // console.log('!= 1');           
    //         if (i > 0) {
    //           let note3 = notes_half_bar[i - 1][1];
    //           if (note3.length != 1) {
    //             note3 = [_.last(_.initial(note3))];
    //           }
    //           note3 = Util.noteToNumber(this.all_posible_note, note3)[0];
    //           diff = ~~(Math.abs(note3 - note2) / 2);
    //           // console.log(note3 + ' > ' + note1 + ' > ' + note2);              
    //         }
    //         if (note1 - note2 > 1) {
    //           notes_half_bar[i][0][notes_half_bar[i][0].length - 1] = this.all_posible_note[note2 + diff];
    //           // console.log(' > 1 = ' + diff);
    //         } else if (note1 - note2 < -1) {
    //           notes_half_bar[i][0][notes_half_bar[i][0].length - 1] = this.all_posible_note[note2 - diff];
    //           // console.log(' < -1 = ' + diff);
    //         }
    //       }
    //       // console.log('---------------------------');

    //     }

    //     let new_notes = _.concat(tmp_head, _.flattenDeep(notes_half_bar), tmp_last);

    //     bars.notes = [];
    //     bars.pattern.forEach(patt => {
    //       let chunk = patt.replace(/_/g, '').length;
    //       bars.notes.push(new_notes.splice(0, chunk));
    //     })

    //     // console.log(bars.notes);
    //     for (let i = 0; i < bars.notes.length; i++) {
    //       bars.notes[i] = this.passingToneInBar(bars.notes[i])
    //     }

    //   }
    //   // console.log('-----------------------');
    //   // console.log(bars.notes);

    //   // console.log(_.chunk(_.flattenDeep(bars.notes), 8));

    //   // console.log(bars);
    //   let notes_join = _.flattenDeep(bars.notes);
    //   new_patt = '';
    //   seek = 0;
    //   let before_note = null;

    //   bars.notes = [];
    //   for (let i = 0; i < this.simpleChordProgression.length; i++) {
    //     const progress = this.simpleChordProgression[i];
    //     let size = progress.length / 32;
    //     let pattx = patt.substr(seek, size);
    //     seek += size;
    //     let slice = pattx.replace(/_/g, '').length

    //     let notes = notes_join.slice(0, slice);

    //     notes_join = notes_join.slice(slice - notes_join.length);
    //     let chord_pitch = _.uniq(Util.getPitch(progress.note))
    //     let new_pitch = notes[0];
    //     let p = Util.getPitch(notes[0])
    //     let o = Util.getOctave(notes[0])
    //     let notes_key = this.Note[this.key].slice(0);

    //     if (chord_pitch.indexOf(p) < 0) {
    //       let chord_oct = Util.generateNoteWithOctave(chord_pitch, 5, 3);
    //       let chord_num = Util.noteToNumber(this.all_posible_note, chord_oct);
    //       let cur_note = Util.noteToNumber(this.all_posible_note, notes[0]);
    //       before_note = Util.noteToNumber(this.all_posible_note, before_note);
    //       let after_note;
    //       if (notes.length > 1) {
    //         after_note = notes[1]
    //       } else if (notes_join.length != 0) {
    //         after_note = notes_join[0];            
    //       } else {
    //         after_note = notes[0];
    //       }
    //       after_note = Util.noteToNumber(this.all_posible_note, after_note);

          
    //       let start = (before_note >= 0) ? before_note : cur_note;
    //       let end = (after_note >= 0) ? after_note : cur_note;
    //       let tmp_chord_num = chord_num.filter((n) => ((a, b) => {
    //         var min = Math.min.apply(Math, [a, b]),
    //         max = Math.max.apply(Math, [a, b]);
    //         return n >= min && n <= max;
    //       })(start, end));
          
    //       if (tmp_chord_num.length > 0) {
    //         new_pitch = Util.numberToNote(this.all_posible_note, Util.randomElement(tmp_chord_num));
    //       } else {
    //         tmp_chord_num = chord_num.map(n => Math.abs(cur_note - n));
    //         let min = Math.min(...tmp_chord_num);
    //         // console.log(chord_oct);
    //         // console.log(chord_num);
    //         // console.log(before_note);
    //         // console.log(cur_note);
    //         // console.log(after_note);
    //         // console.log(tmp_chord_num);
    //         // console.log(min);

    //         tmp_chord_num = chord_oct.filter((n, idx) => tmp_chord_num[idx] == min);
    //         new_pitch = Util.randomElement(tmp_chord_num);
    //       }
    //       // console.log('==============================');
    //     }

    //     notes[0] = new_pitch;
    //     before_note = notes[notes.length - 1];
    //     bars.notes.push(notes)
    //   }



    //   this.melody = scribble.clip({
    //     notes: _.flattenDeep(bars.notes),
    //     pattern: _.join(bars.pattern, '')
    //   });

    //   this.melody = this.Velocity.generateVelocityMelody(this.melody);
    // }
  }

  moveBarUpDown(first_note, notes, patt, possible_note, expected_mid, up) {
    let new_possible_note = [];
    let update = up ? 1 : -1;
    if (up) {
      new_possible_note = possible_note.filter(n => n >= first_note);
    } else {
      new_possible_note = possible_note.filter(n => n <= first_note);
    }
    if (new_possible_note.length == 0) {
      // console.log('break;');
      return notes;
    }
    let new_expected_mid = expected_mid - (update * Util.randomElement([1, 2]));

    // console.log('new pos => ' + new_possible_note);
    // console.log('new exp => ' + new_expected_mid);

    let best_notes = first_note;
    let best_mid = Number.NEGATIVE_INFINITY;
    for (const n of new_possible_note) {
      // console.log('n => ' + n);
      let new_pitch = Util.changePitch(this.all_posible_note, notes, n - first_note)
      let new_mid = this.findMedium(patt, new_pitch);
      // console.log('new mid => ' + new_mid);

      if (Math.abs(new_expected_mid - new_mid) <= Math.abs(new_expected_mid - best_mid)) {
        best_mid = new_mid;
        best_notes = new_pitch;
      }
      // console.log('+++++');
    }
    return best_notes;
  }

  passingToneInBar(notes) {
    let pitch_pos = [];
    if (notes.length <= 2) {
      return notes;
    }
    LoopA: while (1) {
      pitch_pos = Util.noteToNumber(this.all_posible_note, notes);
      // console.log(notes);
      // console.log(pitch_pos);
      LoopB: for (let j = 1; j < pitch_pos.length - 1; j++) {
        // console.log(pitch_pos[j - 1] + ' > ' + pitch_pos[j] + ' > ' + pitch_pos[j + 1]);
        let curr = pitch_pos[j];
        let next = pitch_pos[j + 1];
        let prev = pitch_pos[j - 1];
        let diff = Math.abs(prev - next);
        if (prev == next) {
          if (prev - curr > 2) {
            notes[j] = this.all_posible_note[curr + 2];
            // console.log('aaaaaaaaaaaaaaaaaaaaaaaa');
            break LoopB;
          } else if (prev - curr < -2) {
            notes[j] = this.all_posible_note[curr - 2];
            // console.log('bbbbbbbbbbbbbbbbbbbbbbb');

            break LoopB;
          }
        } else if (prev > curr && next > curr) {
          notes[j] = this.all_posible_note[curr + diff];
          // console.log('cccccccccccccccccccccccc');
          break LoopB;
        } else if (
          (prev == curr && next > curr + 1) ||
          (next == curr && prev > curr + 1)
        ) {
          notes[j] = this.all_posible_note[curr + ~~(diff / 2)];
          // console.log('dddddddddddddddddd');
          break LoopB;
        } else if (prev < curr && next < curr) {
          notes[j] = this.all_posible_note[curr - diff];
          // console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeee');
          break LoopB;
        } else if (
          (prev == curr && next < curr - 1) ||
          (next == curr && prev < curr - 1)
        ) {
          notes[j] = this.all_posible_note[curr - ~~(diff / 2)];
          // console.log('ffffffffffffffffffffffffffff');
          break LoopB;
        }
        if (j == pitch_pos.length - 2) {
          break LoopA;
        }
      }
      // console.log('----------------------------');
    }
    return notes;
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {string} str_pattern The numeric MIDI pitch value to convert.
   * @returns {string} The resulting symbolic note name.
   */
  increaseOctave(notes, inc = 2) {
    if (Array.isArray(notes))
      return notes.map(note => {
        return note.slice(0, note.length - 1) + (+note[note.length - 1] + inc);
      })
    return notes.slice(0, notes.length - 1) + (+notes[notes.length - 1] + inc);
  }

  
  findMedium(patt, note) {
    let count = -1;
    let w = patt.split('').map(ch => {
      if (ch == 'x') count++;
      return this.all_posible_note.indexOf(note[count]);
    });
    let middle = ~~(_.reduce(w, function (sum, n) {
      return sum + n;
    }, 0) / w.length);
    return middle;
  }

  findTickFromLength(length) {
    return length / 32;
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @param {string} str_pattern The numeric MIDI pitch value to convert.
   * @returns {string} The resulting symbolic note name.
   */
  composeChordProgreesion(repeat = 1) {
    for (const key in this.chordProgressive) {
      this.chordProgressive[key].cadence = Util.randomElement(this.chordProgressive[key].cadence);
    }
    // this.simpleChordProgression = this.ChordProgression.composeSimpleChord(this.key, this.song_part, this.chordProgressive);
    this.chordProgression = this.ChordProgression.composeVoicingChord(this.key, this.song_part, this.chordProgressive, this.barPerPart);
    this.chordProgression = this.Velocity.generateVelocityChord(this.chordProgression);
  }  

  getKeySig() {
    return this.key;
  }

  getMelody() {
    return this.melody;
  }

  getChordProgression() {
    return this.chordProgression;
  }

  getSimpleChordProgression() {
    return this.simpleChordProgression;
  }

  getInstrumentChord() {
    return this.instChord;
  }

  getInstrumentMelody() {
    return this.instMelody;
  }

  getTempo() {
    return this.tempo;
  }

  replaceAt(arr, index, replacement) {
    return arr.substr(0, index) + replacement + arr.substr(index + replacement.length);
  }
}

module.exports = MusicGenerator;