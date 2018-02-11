const _ = require('lodash');
const scribble = require('scribbletune');
const Engine = require('json-rules-engine').Engine;
const rule = require('./music_rules');
const Const = require('./music_constant');

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
    this.key = (typeof this.keySig == 'string') ? this.keySig:this.initAnything(this.keySig);
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
        if (me.facts.melody.lastBar.pattern){
          me.lastbar = me.randomElement(me.facts.melody.lastBar.pattern);
        }
      },
      onFailure: function (event, almanac) {

      }
    }
  }

  initEngine() {
    this.engine = new Engine()
    this.engine.addOperator('allContains', (facts_value, rule_value) => {
      return (typeof facts_value == 'string') ? (rule_value.indexOf(facts_value) >= 0):(_.difference(facts_value, rule_value).length === 0);
    })
    this.engine.addOperator('arr2D_allContains', (facts_value, rule_value) => {
      if (Array.isArray(facts_value)) {
        let flag = true;
        facts_value.forEach(arr => {
          let isContain = _.difference(arr, rule_value).length === 0;
          if(!isContain)
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
          if(typeof el != 'string'){
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

  findFirstOctaveFromNote(notes){
    return (notes[0][0].toLowerCase() == 'a' || notes[0][0].toLowerCase() == 'b')?3:4;
  }

  generateChordFromNote(notes){
    let chords = {};
    let chord_length = [0,2,2,3];
    let first_oct = this.findFirstOctaveFromNote(notes);
    for (let i in Const.chordsName){
      chords[Const.chordsName[i]] = [];
      let octave = first_oct;
      let pos = Number(i);
      for (let j in chord_length) {
        pos += Number(chord_length[j]);
        if (pos >= notes.length){
          pos %= notes.length;
          octave += 1;
        }
        chords[Const.chordsName[i]].push(notes[pos] + octave);
      }
    }
    return chords;
  }

  generateNoteFromKey(key, scale){
    key = key.toLowerCase();
    let start = Const.semitone.indexOf(key);
    if(start < 0){
      key = _.invert(Const.flat_notes)[key];
      start = Const.semitone.indexOf(key);
    }
    let notes = [];
    let size = Const.semitone.length;
    for(let i of scale){
      notes.push(Const.semitone[start]);
      start = (start + i * 2) % size;
    }

    return notes;
  }

  composeMelody(notes) {
    let melodies = [];
    let pattern = '';
    if(this.chordProgression){
      this.chordProgression.forEach((chord, idx, arr) => {
        let new_pattern = '';
        if (idx == 0){
          new_pattern = 'x';
        }
        if (idx >= arr.length - 2 && this.lastbar) {
          new_pattern = this.lastbar;          
        } else {
          let tick = this.findTickFromLength(chord.length);
          for (let i = 0; i < tick; i++){
            new_pattern += (Math.random() > 0.5)? 'x':'_';
          }    
          new_pattern = new_pattern.substring(0, tick);
        }
        console.log(new_pattern);
        let new_notes = new_pattern.replace(/_/g, '');        
        let expected_note = this.findNoteFromChord(chord.note);
        let octave = Number(chord.note[0][chord.note[0].length-1])+2;
        for (let i = 0; i < new_notes.length; i++) {
          melodies.push(this.randomElement(expected_note) + octave);
        }
        pattern += new_pattern;
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

  composeChordProgreesion(chords, repeat = 1) {
    let progress = [];
    this.chordProgression = [];      
    if(this.song_part != null){
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

  generateChordProgreesion(chord_progress, chords, repeat){
    let progress = [];
    for(let i=0; i < repeat; i++)
      chord_progress.chordChunk.forEach(chord => {
        progress.push(chords[chord]);
      });
    return scribble.clip({
      notes: progress,
      pattern: chord_progress.pattern.repeat(repeat),
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

  randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

module.exports = MusicGenerator;