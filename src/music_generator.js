const _ = require('lodash');
const scribble = require('scribbletune');
const Engine = require('json-rules-engine').Engine;
const rule = require('./music_rules');
const Const = require('./music_constant');
const assert = require('assert');

class MusicGenerator {

  constructor() {

    this.melody = [];
    this.chordProgression = null;

    this.scale = [1, 1, 0.5, 1, 1, 1, 0.5];

    this.initRule();
    this.initEngine();
  }

  init() {
    this.tempo = this.initAnything(this.tempos);
    this.key = (typeof this.keySig == 'string') ? this.keySig : this.initAnything(this.keySig);
    this.instMelody = this.initAnything(this.instMelodyList);
    this.instChord = this.initAnything(this.instChordList);
  }

  initAnything(anything) {
    if (Array.isArray(anything)) {
      // return anything[this.random(anything)]
      return this.randomElement(anything);
    } else if (typeof anything == 'object') {
      return Math.floor(Math.random() * (anything.max - anything.min + 1)) + anything.min;
    } else {
      return anything;
    }
  }

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
          me.lastbar = me.randomElement(me.facts.melody.lastBar.pattern);
        }
        me.motif = me.generateMotif(me.facts.melody.motif[1]);
        me.tick = me.facts.melody.tick;
        // me.note_in_chord = me.facts.melody.note_in_chord;
        me.note_in_chord = [1, 0, 1, 0];
        me.passingtone = true;
      },
      onFailure: function (event, almanac) {

      }
    }
  }

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

  findFirstOctaveFromNote(notes) {
    return (notes[0][0].toLowerCase() == 'a' || notes[0][0].toLowerCase() == 'b') ? 3 : 4;
  }

  generateChordFromNote(notes) {
    let chords = {};
    let chord_length = [0, 2, 2, 3];
    let first_oct = this.findFirstOctaveFromNote(notes);
    let tmp_note = '';
    let octave = first_oct;
    notes = _.flatten(Array(2).fill(notes));
    notes = notes.map(n => {
      if (tmp_note == '') {
        tmp_note = n;
        return n + first_oct;
      } else {
        if (Const.semitone.indexOf(tmp_note) > Const.semitone.indexOf(n)) {
          octave++;
        }
        tmp_note = n;
        return n + octave;
      }
    });

    for (let i in Const.chordsName) {
      if (Const.chordsName[i] == Const.chordsName[5] || Const.chordsName[i] == Const.chordsName[6]) {
        octave--;
      }
      chords[Const.chordsName[i]] = [];
      let pos = Number(i);
      for (let j in chord_length) {
        pos += Number(chord_length[j]);
        chords[Const.chordsName[i]].push(notes[pos]);
      }
    }
    let decrease_oct = n => n.substring(0, n.length - 1) + (n.substr(n.length - 1) - 1);
    chords[Const.chordsName[5]] = chords[Const.chordsName[5]].map(decrease_oct);
    chords[Const.chordsName[6]] = chords[Const.chordsName[6]].map(decrease_oct);

    return chords;
  }

  generateNoteFromKey(key, scale) {
    key = key.toLowerCase();
    let start = Const.semitone.indexOf(key);
    if (start < 0) {
      key = _.invert(Const.flat_notes)[key];
      start = Const.semitone.indexOf(key);
    }
    let notes = [];
    let size = Const.semitone.length;
    for (let i of scale) {
      notes.push(Const.semitone[start]);
      start = (start + i * 2) % size;
    }
    this.notes = notes; ////////////////
    return notes;
  }

  composeMelody(notes) {
    let melodies = [];
    let pattern = '';
    let me = this;
    if (this.chordProgression) {
      let chordPerNote = [];
      let octave = 6;
      this.chordProgression.forEach((chord, idx, arr) => {
        let rand = me.random(me.motif.up);
        let rand1 = me.random(me.motif.down);
        let motif = me.motif.up[rand]
        let motif1 = me.motif.down[rand1]
        let new_pattern = motif.pattern || '';
        let motif_down_pos_str = Math.abs(~~(Math.random() * (16 - new_pattern.length - motif.pattern.length) + new_pattern.length));
        let tick = me.findTickFromLength(chord.length);
        if (idx == 0) {
          if (new_pattern == '') {
            new_pattern = 'x';
          }
        }
        if (!(idx >= arr.length - 1 && me.lastbar)) {
          for (let i = 0; i < tick; i++) {
            new_pattern += (Math.random() > 0.85) ? 'x' : '_';
          }
        }
        new_pattern = (idx >= arr.length - 1 && me.lastbar) ? me.lastbar : new_pattern.slice(0, motif_down_pos_str) + motif1.pattern + new_pattern.slice(motif_down_pos_str)
        new_pattern = new_pattern.substring(0, tick);
        let new_notes = new_pattern.replace(/_/g, '').length;
        let notes_before_motif_down = new_pattern.slice(0, motif_down_pos_str).replace(/_/g, '').length;
        let expected_note = me.findNoteFromChord(chord.note, octave);
        // let octave = Number(chord.note[0][chord.note[0].length - 1]) + 2;
        let m = motif.notes[0];
        let c = 0;
        let melody = expected_note[0][0];
        let l = (motif.notes.length < new_notes) ? motif.notes.length : new_notes;
        let mld = [];
        let o = octave
        for (let i = 0; i < l; i++) {
          m = motif.notes[c++];
          let n = me.notes.indexOf(melody) + m;
          // o = (n > me.notes.length) ? o + 1 : 
          //     (n < 0) ? o - 1 : o;
          o = (n > me.notes.length) ? o + 1 : o;
          n = (n < 0) ? n + me.notes.length : n;
          melody = me.notes[n % me.notes.length];
          mld.push(melody + o);
        }
        l = Math.abs(notes_before_motif_down - motif.notes.length);
        for (let i = 0; i < l; i++) {
          mld.push(me.randomElement(expected_note));
        }
        c = 0;
        l = (motif1.notes.length < new_notes - motif.notes.length) ? motif1.notes.length : new_notes - motif.notes.length;
        melody = expected_note[0][0];
        o = octave;
        for (let i = 0; i < l; i++) {
          m = motif1.notes[c++];
          let n = me.notes.indexOf(melody) + m;
          o = (n > me.notes.length) ? o + 1 : o;
          n = (n < 0) ? n + me.notes.length : n;
          melody = me.notes[n % me.notes.length];
          mld.push(melody + o);
        }
        l = new_notes - motif1.notes.length - motif.notes.length;
        for (let i = 0; i < l; i++) {
          mld.push(me.randomElement(expected_note));
        }
        mld = mld.slice(0, new_notes);
        melodies = _.concat(melodies, mld);
        pattern += new_pattern;
      });

      let bars = {};
      let melodies1 = melodies.slice();
      bars.pattern = pattern.match(/.{1,16}/g);
      bars.notes = [];
      bars.pattern.forEach(patt => {
        let chunk = patt.replace(/_/g, '').length;
        bars.notes.push(melodies1.splice(0, chunk));
      })

      this.tick = [1, 0, 1, 0];
      if (this.tick) {
        for (let i = 0; i < bars.pattern.length; i++) {
          this.tick.forEach((t, j) => {
            let add = Math.random() < t;
            if (bars.pattern[i].charAt(j * 4) == '_' && add) {
              bars.pattern[i] = this.replaceAt(bars.pattern[i], j * 4, 'a');
            }
          });

          let new_patt = bars.pattern[i].replace(/_/g, '');
          let start = 0;
          let n = 0;
          while (n >= 0) {
            n = new_patt.substr(start).search('a');
            start = start + n + 1;
            if (n >= 0) {
              bars.notes[i].splice(start - 1, 0, bars.notes[i][start - 2]);
            }
          }
        }

      }
      bars.pattern = bars.pattern.map(patt => patt.replace(/a/g, 'x'))
      // console.log(bars);
      if (this.passingtone) {
        let chordProgression = [];
        let chord_temp = [];
        let length = 0;
        this.chordProgression.forEach(progress => {
          length += progress.length;
          chord_temp.push({
            note: progress.note,
            length: progress.length / 32
          });
          if (length >= 512) {
            length = 0;
            chordProgression.push(chord_temp)
            chord_temp = [];
          }
        });
        // console.log(chordProgression);

        let all_posible_note = [];
        let tmp_note = '';
        let tmp_oct = octave - 1;
        for (let i = 0; i < 3; i++) {
          notes.forEach(n => {
            if (tmp_note == '') {
              tmp_note = n;
              all_posible_note.push(n + tmp_oct);
            } else {
              if (Const.semitone.indexOf(tmp_note) > Const.semitone.indexOf(n)) {
                tmp_oct++;
              }
              tmp_note = n;
              all_posible_note.push(n + (tmp_oct));
            }
          });
        }
        // console.log(all_posible_note);
        // console.log('--------------------------------------');

        // console.log(_.chunk(_.flattenDeep(bars.notes), 6));

        for (let i = 0; i < chordProgression.length; i++) {
          let seek = 0;
          let patt_chunk = [];
          let chord_of_note = [];
          let pitch_pos = [];
          let rythm_pos = [];
          let cache_note = _.fill(Array(4), false);
          let pitch_gap = [0];
          chordProgression[i].forEach(chord => {
            patt_chunk.push(bars.pattern[i].substr(seek, chord.length));
            seek += chord.length;
          });
          // console.log('---------------------------------');
          patt_chunk.forEach((patt, ichord) => {
            let count_note = patt.replace(/_/g, '').length;
            chord_of_note.push(_.fill(Array(count_note), chordProgression[i][ichord].note));
          });
          chord_of_note = _.flattenDeep(chord_of_note);
          chord_of_note = chord_of_note.map(note => {
            return note.slice(0, note.length - 1) + (+note[note.length - 1] + 2);
          });
          chord_of_note = _.chunk(chord_of_note, 4);

          bars.pattern[i].split('').forEach((ch, i) => {
            if (ch == 'x') {
              rythm_pos.push(i);
            }
          });
          // console.log(bars.notes[i]);

          // this.note_in_chord = [1,0,1,0]
          this.note_in_chord.forEach((n, m) => {
            let k = rythm_pos.indexOf(4 * m);
            if (k != -1 && Math.random() <= n) {
              let note = bars.notes[i][k];
              if (chord_of_note[k].indexOf(note) == -1) {
                let actual_note = all_posible_note.indexOf(note);
                let expected_note = chord_of_note[k].map(n => all_posible_note.indexOf(n));

                // console.log('act1 => ' + actual_note);
                // console.log('expt => ' + expected_note);
                if (actual_note >= _.last(expected_note)) {
                  actual_note = _.last(expected_note);
                } else {
                  let cur = expected_note[0];
                  for (let e of expected_note) {
                    if (Math.abs(e - actual_note) < Math.abs(e - cur))
                      cur = actual_note;
                  }
                  actual_note = cur;
                }
                // console.log('act2 => ' + actual_note);
                // console.log('act2 => ' + all_posible_note[actual_note]);

                bars.notes[i][k] = all_posible_note[actual_note];
              }
              cache_note[m] = bars.notes[i][k];
            }
          });

          console.log(bars.pattern[i]);
          console.log(bars.notes[i]);

          _.fill(Array(3)).forEach(a => {
            pitch_pos = [];
            pitch_gap = [];

            for (let j = 0; j < bars.notes[i].length; j++) {
              pitch_pos.push(all_posible_note.indexOf(bars.notes[i][j]));
            }

            for (let j = 0; j < pitch_pos.length - 1; j++) {
              pitch_gap.push(pitch_pos[j + 1] - pitch_pos[j]);
            }
            for (let j = 1; j < pitch_gap.length; j++) {
              if (pitch_gap[j] < -7) {
                pitch_pos[j] -= 7;
              } else if (pitch_gap[j] < -3) {
                pitch_pos[j] -= 3;
              }
              if (pitch_gap[j] > 7) {
                pitch_pos[j] += 7;
              } else if (pitch_gap[j] > 3) {
                pitch_pos[j] += 3;
              }
              bars.notes[i][j] = all_posible_note[pitch_pos[j]];
            }
          });
          console.log(bars.notes[i]);

          pitch_pos = [];
          for (let j = 0; j < bars.notes[i].length; j++) {
            pitch_pos.push(all_posible_note.indexOf(bars.notes[i][j]));
          }

          let max_pos = Math.max(...pitch_pos);
          let min_pos = Math.min(...pitch_pos);
          console.log(pitch_pos);
          console.log(max_pos);
          console.log(min_pos);

          if (max_pos - min_pos >= 5) {
            // let middle = ~~(min_pos + (max_pos - min_pos) / 2);

            let count = -1;
            let w = bars.pattern[i].split('').map(ch => {
              if (ch == 'x') count++;
              return all_posible_note.indexOf(bars.notes[i][count]);
            });
            let middle = ~~(_.reduce(w, function (sum, n) {
              return sum + n;
            }, 0) / w.length);

            let middle_gap = [];
            for (let j = 0; j < pitch_pos.length; j++) {
              middle_gap.push(pitch_pos[j] - middle);
            }

            for (let j = 0; j < middle_gap.length; j++) {
              if (middle_gap[j] > 4) {
                pitch_pos[j] -= 4;
              } else if (middle_gap[j] < -4) {
                pitch_pos[j] += 4;
              } else if (middle_gap[j] > 2) {
                pitch_pos[j] -= 2;
              } else if (middle_gap[j] < -2) {
                pitch_pos[j] += 2;
              }
              bars.notes[i][j] = all_posible_note[pitch_pos[j]];
            }

            console.log('mid => ' + middle);
            console.log(middle_gap);
          }

          LoopA:
            while (1) {
              pitch_pos = [];
              for (let j = 0; j < bars.notes[i].length; j++) {
                pitch_pos.push(all_posible_note.indexOf(bars.notes[i][j]));
              }
              console.log(pitch_pos);
              LoopB:
                for (let j = 1; j < pitch_pos.length - 1; j++) {
                  console.log(pitch_pos[j - 1] + ' > ' + pitch_pos[j] + ' > ' + pitch_pos[j + 1]);
                  if (pitch_pos[j - 1] == pitch_pos[j + 1]) {
                    if (pitch_pos[j - 1] - pitch_pos[j] > 2) {
                      bars.notes[i][j] = all_posible_note[pitch_pos[j] + 2];
                      break LoopB;
                    } else if (pitch_pos[j - 1] - pitch_pos[j] < -2) {
                      bars.notes[i][j] = all_posible_note[pitch_pos[j] - 2];
                      break LoopB;
                    }
                  } else if (pitch_pos[j - 1] > pitch_pos[j] && pitch_pos[j + 1] > pitch_pos[j]) {
                    bars.notes[i][j] = all_posible_note[pitch_pos[j] + Math.abs(pitch_pos[j - 1] - pitch_pos[j + 1])];
                    break LoopB;                    
                  } else if (
                    (pitch_pos[j - 1] == pitch_pos[j] && pitch_pos[j + 1] > pitch_pos[j] + 1) || 
                    (pitch_pos[j + 1] == pitch_pos[j] && pitch_pos[j - 1] > pitch_pos[j] + 1)
                  ) {
                    bars.notes[i][j] = all_posible_note[pitch_pos[j] + ~~(Math.abs(pitch_pos[j - 1] - pitch_pos[j + 1]) / 2)];
                    break LoopB;
                  } else if (pitch_pos[j - 1] < pitch_pos[j] && pitch_pos[j + 1] < pitch_pos[j]) {
                    bars.notes[i][j] = all_posible_note[pitch_pos[j] - Math.abs(pitch_pos[j - 1] - pitch_pos[j + 1])];
                    break LoopB;
                  } else if (
                    (pitch_pos[j - 1] == pitch_pos[j] && pitch_pos[j - 1] < pitch_pos[j] - 1) ||
                    (pitch_pos[j + 1] == pitch_pos[j] && pitch_pos[j - 1] < pitch_pos[j] - 1)
                  ) {
                    bars.notes[i][j] = all_posible_note[pitch_pos[j] - ~~(Math.abs(pitch_pos[j - 1] - pitch_pos[j + 1]) / 2)];
                    break LoopB;
                  }
                  if (j == pitch_pos.length - 2) {
                    break LoopA;
                  }
                }
            }

          // console.log(chordProgression[i]);
          console.log(bars.notes[i]);
          // console.log(chord_of_note);
          // console.log(cache_note);
          console.log(rythm_pos);
          console.log('---------------------------------');
        }

        // console.log(this.chordProgression);        
      }

      this.melody = scribble.clip({
        notes: _.flattenDeep(bars.notes),
        pattern: _.join(bars.pattern, '')
      });
    }
  }

  findTickFromLength(length) {
    return length / 32;
  }

  findNoteFromChord(chord, octave) {
    let base = chord[0][chord[0].length - 1];
    chord = chord.map(function (note) {
      let o = octave;
      if (note[note.length - 1] > base) {
        o = octave + 1;
      }
      if (note.length == 3) {
        return note[0] + note[1] + o;
      } else {
        return note[0] + o;
      }
    });
    return chord.slice(0, -1);
  }

  composeChordProgreesion(chords, repeat = 1) {
    let progress = [];
    this.chordProgression = [];
    if (this.song_part != null) {
      repeat = this.barPerPart || repeat;
      this.song_part.forEach(part => {
        this.chordProgression = _.concat(this.chordProgression, this.generateChordProgreesion(this.chordProgressive[part], chords, repeat));
      });
    } else {
      let loop = this.chordProgressive.main.loop || 1
      for (let i = 0; i < loop; i++)
        this.chordProgression = _.concat(this.chordProgression, this.generateChordProgreesion(this.chordProgressive.main, chords, repeat));
    }
  }

  generateChordProgreesion(chord_progress, chords, repeat) {
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

  generateMotif(motif) {
    let motives_up = [motif];
    let notes = [2, 4];
    for (let note of notes) {
      motives_up.push({
        notes: _.concat(motif.notes[0] + note, motif.notes.slice(1)),
        pattern: motif.pattern
      });
    }
    motif = {
      notes: motif.notes.map(x => x * -1),
      pattern: motif.pattern
    };
    let motives_down = [motif];
    for (let note of notes) {
      motives_down.push({
        notes: _.concat(motif.notes[0] + note, motif.notes.slice(1)),
        pattern: motif.pattern
      });
    }

    let patterns = [];
    // let pattern = this.increaseTimeOfPattern(motif.pattern);
    // let l = 0;
    // while (l <= 16) {
    //   l = pattern.length;
    //   patterns.push(pattern);
    //   pattern = this.increaseTimeOfPattern(pattern);
    // }

    // console.log(motif.pattern);

    let pattern = this.decreaseTimeOfPattern(motif.pattern);
    while (1) {
      if (pattern == '') {
        break;
      }
      patterns.push(pattern)
      pattern = this.decreaseTimeOfPattern(pattern);
    }

    let motives = {
      up: motives_up,
      down: motives_down
    };
    patterns.forEach(x => {
      motives_up.forEach(x1 => {
        motives.up.push({
          notes: x1.notes,
          pattern: x
        });
      })
      motives_down.forEach(x1 => {
        motives.down.push({
          notes: x1.notes,
          pattern: x
        });
      })
    });

    return motives;
  }

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

  decreaseTimeOfPattern(str_pattern) {
    let patterns = str_pattern.split('x');
    if (patterns[0] == '') {
      patterns.shift();
    }

    if (patterns.indexOf('') >= 0) {
      return '';
    }

    patterns = patterns.map(x => 'x' + x);
    patterns = patterns.map(x => x.substr(0, x.length / 2));
    patterns = _.join(patterns, '');
    return patterns;
  }

  getMelody() {
    return this.melody
  }

  getChordProgression() {
    return this.chordProgression;
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

  random(arr) {
    return Math.floor(Math.random() * arr.length);
  }

  randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  replaceAt(arr, index, replacement) {
    return arr.substr(0, index) + replacement + arr.substr(index + replacement.length);
  }
}

module.exports = MusicGenerator;