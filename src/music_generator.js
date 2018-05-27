const _ = require('lodash');
const scribble = require('scribbletune');
const Engine = require('json-rules-engine').Engine;
const rule = require('../config/music_rules');
const Const = require('../config/music_constant');
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
    this.tempo = this.initAnything(this.temposFact);
    this.key = this.initAnything(this.keySigFact).toLowerCase();
    this.instMelody = this.initAnything(this.instMelodyListFact);
    this.instChord = this.initAnything(this.instChordListFact);
    this.motif = this.initAnything(this.motifFact);
    this.motif = new Motif().generateMotif(this.motif);
    this.song_part = this.initAnything(this.song_partFact);
    this.chordProgressive =  _.mapValues(this.chordProgressiveFact, c => {
      let obj = Object.assign({}, c);
      obj.chord = Util.randomElement(c.chord);
      return obj;
    });  

    this.Velocity.setSongpart(this.song_part);
    this.Velocity.setChordProgressive(this.chordProgressive);
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
      onSuccess: (event, almanac) => {
        this.temposFact = this.facts.init.Tempo;
        this.instMelodyListFact = this.facts.init.InstrumentMelody;
        this.instChordListFact = this.facts.init.InstrumentChord;
        this.keySigFact = this.facts.init.KeySignature;

        almanac.addRuntimeFact('initSuccess', true)
      },
      onFailure: (event, almanac) => {
        almanac.addRuntimeFact('initSuccess', false)
      }
    }

    this.songPartRule = {
      conditions: rule.songPart,
      event: {
        type: 'Song Part'
      },
      priority: 9,
      onSuccess: (event, almanac) => {
        this.song_partFact = this.facts.songPart.pattern;
        almanac.addRuntimeFact('songPartSuccess', true)
      },
      onFailure: (event, almanac) => {
        almanac.addRuntimeFact('songPartSuccess', false)
      }
    };

    this.chordProgressiveRule = {
      conditions: rule.chordProgressive,
      event: {
        type: 'Chord progressive'
      },
      priority: 8,
      onSuccess: (event, almanac) => {
        this.chordProgressiveFact = this.facts.chordProgressive;
        almanac.addRuntimeFact('chordSuccess', true)
      },
      onFailure: (event, almanac) => {
        almanac.addRuntimeFact('chordSuccess', false)
      }
    }

    this.melodyRule = {
      conditions: rule.molody,
      event: {
        type: 'Melody'
      },
      priority: 5,
      onSuccess: (event, almanac) => {
        this.motifFact = this.facts.melody.motif;
        // me.motif = new Motif().generateMotif(me.facts.melody.motif[1]);
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

    this.engine.addOperator('compatMotif', (facts_value, rule_value) => {      
      if (Array.isArray(facts_value)) {        
        for (let i = 0; i < facts_value.length; i++) {
          const el = facts_value[i];
          if (typeof el != 'object') {
            return false;
          } else {
            if (!Array.isArray(el.notes)) {
              return false;
            } else if (typeof el.pattern != 'string') {
              return false;
            } else {
              for (let j = 0; j < el.notes.length; j++) {             
                if (typeof el.notes[j] != 'number'){
                  return false;
                }
              }
            }
          }
        }
        return true;
      }
      return false;
    })

    this.engine.addRule(this.initializeRule);
    this.engine.addRule(this.songPartRule);
    this.engine.addRule(this.chordProgressiveRule);
    this.engine.addRule(this.melodyRule);
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
  }

  /**
   * Convert a numeric MIDI pitch value (e.g. 60) to a symbolic note name(e.g. "c4").   *
   * 
   * @returns {string} The resulting symbolic note name.
   */
  composeChordProgreesion() {
    for (const key in this.chordProgressive) {
      this.chordProgressive[key].cadence = Util.randomElement(this.chordProgressive[key].cadence);
    }
    this.chordProgression = this.ChordProgression.composeVoicingChord(this.key, this.song_part, this.chordProgressive, this.barPerPart);
    this.chordProgression = this.Velocity.generateVelocityChord(this.chordProgression);

    this.simpleChordProgression = '';
    for (let i = 0; i < this.song_part.length; i++) {
      const p = this.song_part[i];
      this.chordProgressive[p].chord.forEach(c => {
        this.simpleChordProgression += Util.chordToNumber(c);
      })
      if (this.chordProgressive[p].chord.length == 2){
        this.chordProgressive[p].chord.forEach(c => {
          this.simpleChordProgression += Util.chordToNumber(c);
        })
      }
      this.simpleChordProgression += Util.chordToNumber(this.chordProgressive[p].cadence);
      if (i < this.song_part.length - 1) this.simpleChordProgression += ',';
    }   
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

  getMotif() {        
    let stack = this.motif[0].up[0].notes.slice(0);
    let curr = stack[0];
    for (let i = 1; i < stack.length; i++) {
      stack[i] = Number(curr) + Number(stack[i]);
      curr = stack[i];
    }
    
    return stack.join('');
  }

  getTempo() {
    return this.tempo;
  }

}

module.exports = MusicGenerator;