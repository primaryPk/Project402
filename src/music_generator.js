const _ = require('lodash');
const scribble = require('scribbletune');
const Engine = require('json-rules-engine').Engine;

const n4 = 'x_______________';
const n2 = 'x_______';
const n1 = 'x___';

class MusicGenerator {

  constructor() {
    this.melody = [];
    this.chordProgression = null;

    this.semitone = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
    this.flat_notes= { 'a#': 'bb', 'c#': 'db', 'd#': 'eb', 'f#': 'gb', 'g#': 'ab' },
    this.scale = [1, 1, 0.5, 1, 1, 1, 0.5];  
    this.chordsName = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'];

    this.initRule();
    this.initEngine();
  }

  init() {
    this.tempo = this.initAnything(this.tempos);
    this.key = (typeof this.keySig == 'string') ? this.keySig:this.initAnything(this.keySig);
    this.instMelody = this.initAnything(this.instMelodyList);
    this.instChord = this.initAnything(this.instChordList);
  }

  initAnything(anything) {
    if (Array.isArray(anything)) {
      return anything[this.random(anything)];
    } else if (typeof anything == 'object') {
      return Math.floor(Math.random() * (anything.max - anything.min + 1)) + anything.min;
    } else {
      return anything;
    }
  }

  initRule() {
    let me = this;
    this.initializeRule = {
      conditions: {
        all: [{
            fact: 'init',
            path: 'KeySignature',
            operator: 'allContains',
            value: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']
          }, {
            fact: 'init',
            path: 'Tempo',
            operator: 'between',
            value: {
              min: 0,
              max: 127
            }
          },
          // {
          //   fact: 'init',
          //   path: 'TimeSignature',
          //   operator: 'allContains',
          //   value: ['3/4', '4/4']
          // },
          {
            fact: 'init',
            path: 'InstrumentMelody',
            operator: 'between',
            value: {
              min: 0,
              max: 127
            }
          }, {
            fact: 'init',
            path: 'InstrumentChord',
            operator: 'between',
            value: {
              min: 0,
              max: 127
            }
          },
        ]
      },
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

    this.chordProgressiveRule = {
      conditions: {
        all: [{
            fact: 'initSuccess',
            operator: 'equal',
            value: true
          },
          {
            all: [{
              fact: 'chordProgressive',
              path: 'pattern',
              operator: 'equal',
              value: n4
            }, {
              fact: 'chordProgressive',
              path: 'chordChunk',
              operator: 'equal_length',
              value: 4
            }, {
              fact: 'chordProgressive',
              path: 'chordChunk',
              operator: 'allContains',
              value: this.chordsName
            }]
          }
        ]
      },
      event: {
        type: 'Chord progressive'
      },
      priority: 8,
      onSuccess: function (event, almanac) {
        almanac.addRuntimeFact('chordSuccess', true)
      },
      onFailure: function (event, almanac) {
        almanac.addRuntimeFact('chordSuccess', false)
      }
    }

    this.melodyRule = {
      conditions: {
        all: [{
          fact: 'chordSuccess',
          operator: 'equal',
          value: true
        },
        {
          any: [{
            fact: 'melody',
            path: 'passingtone',
            operator: 'equal',
            value: true
          }, {
            fact: 'melody',
            path: 'passingtone',
            operator: 'equal',
            value: false
          }]
        }]
      },
      event: {
        type: 'Melody'
      },
      priority: 5,
    }
  }

  initEngine() {
    this.engine = new Engine()
    this.engine.addOperator('allContains', (facts_value, rule_value) => {
      return (typeof facts_value == 'string') ? (rule_value.indexOf(facts_value) >= 0):(_.difference(facts_value, rule_value).length === 0);
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

    this.engine.addRule(this.initializeRule);
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

  findFirstOctaveFromNote(notes){
    return (notes[0][0].toLowerCase() == 'a' || notes[0][0].toLowerCase() == 'b')?3:4;
  }

  generateChordFromNote(notes){
    let chords = {};
    let chord_length = [0,2,2,3];
    let first_oct = this.findFirstOctaveFromNote(notes);
    for (let i in this.chordsName){
      chords[this.chordsName[i]] = [];
      let octave = first_oct;
      let pos = Number(i);
      for (let j in chord_length) {
        pos += Number(chord_length[j]);
        if (pos >= notes.length){
          pos %= notes.length;
          octave += 1;
        }
        chords[this.chordsName[i]].push(notes[pos] + "" + octave);
      }
    }
    return chords;
  }

  generateNoteFromKey(key, scale){
    key = key.toLowerCase();
    let start = this.semitone.indexOf(key);
    if(start < 0){
      key = _.invert(this.flat_notes)[key];
      start = this.semitone.indexOf(key);
    }
    let notes = [];
    let size = this.semitone.length;
    for(let i of scale){
      notes.push(this.semitone[start]);
      start = (start + i * 2) % size;
    }

    return notes;
  }

  composeMelody(notes) {
    let melodies = [];
    let pattern = '';
    if(this.chordProgression){
      this.chordProgression.forEach(chord => {
        let tick = this.findTickFromLength(chord.length);
        for (let i = 0; i < tick; i++){
          pattern += (Math.random() > 0.5)? 'x':'_';
        }
        let total_note = pattern.replace(/_/g, '');
        let expected_note = this.findNoteFromChord(chord.note);
        let octave = Number(chord.note[0][chord.note[0].length-1])+2;
        for (let i = 0; i < total_note.length; i++) {
          melodies.push(expected_note[this.random(expected_note)] + octave);
        }        
      });
      this.melody = scribble.clip({
        notes: melodies,
        pattern: pattern
      });
    }
  }

  findTickFromLength(length){
    return length / 32;
  }

  findNoteFromChord(chord){
    chord = chord.map(note => note[0]);
    return _.uniq(chord);
  }

  composeChordProgreesion(chords, repeat) {
    let progress = [];
    this.facts.chordProgressive.chordChunk.forEach(chord => {
      progress.push(chords[chord]);
    });
    this.chordProgression = scribble.clip({
      notes: progress,
      pattern: this.facts.chordProgressive.pattern.repeat(repeat*4),
      sizzle: true
    });
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
}

module.exports = MusicGenerator;