const scribble = require('scribbletune');

class MusicGenerator {

  constructor() {
    this.melody = [];
    this.chordProgression = null;

    this.init();
    this.initInstruments();
  }

  init() {
    this.tempo = Math.floor(Math.random() * 21) + 60
    this.keySig = ['c', 'g', 'd', 'a', 'e', 'b', 'f#', 'f'];
    this.key = this.random(this.keySig);
  }

  initInstruments() {
    this.instNameChord = ['piano', 'elec piano', 'syn', 'classic guitar', 'folk guitar'];
    this.instNameMelody = ['piano', 'elec piano', 'syn', 'violin', 'viola', 'cello', 'flute', 'obeo', 'clarinets'];
    this.instNumChord = [1, 3, 93, 25, 26];
    this.instNumMelody = [1, 3, 93, 41, 42, 43, 74, 69, 72];
    this.instMelody = this.random(this.instNumMelody);
    this.instChord = this.random(this.instNumChord);
    this.instMelody = 0;
    this.instChord = 3;
    // console.log("Chord: " + this.instNameChord[this.instChord]);
    // console.log("Melody: " + this.instNameMelody[this.instMelody]);
    
  }

  composeMelody(){
    let n4 = 'x_______________';
    let n2 = 'x_______';
    let n1 = 'x___';

    // พรีมต้องแต่งตรงนี้ ตรงนี้ ยัง hardcode อยู่
    this.melody = scribble.clip({
      // notes: ['c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3',
      //         'c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4',
      //         'c5', 'd5', 'e5', 'f5', 'g5', 'a5', 'b5', 'c6'
      //       ],
      notes: ['c5', 'f5', 'g5', 'c5', 'f5', 'a5', 'a5', 'g5', 'g5', 'a5', 'b5', 'c6', 'c6', 'g5', 'e5', 'c5'],
      // pattern: 'x_'.repeat(2) + 'xxx_________'
      //       + 'x_'.repeat(2) + 'xxx_____' + 'x_'.repeat(2)
      //       + n2 + n1 + n1 + n4
      pattern: n1.repeat(16)
    });
  }
  
  composeChordProgreesion(){
    // พรีมต้องแต่งตรงนี้ ตรงนี้ ยัง hardcode อยู่
    this.chordProgression = scribble.clip({
      notes: [
        'Cmaj', 'Fmaj', 'Gmaj', 'Cmaj',
    ],
      pattern: 'x_______________'.repeat(4),
      // pattern: 'x_______'.repeat(14),
      // pattern: 'x_______x_x_____'.repeat(2) + 'x___________x___' + 'x_______________',
      sizzle: true
    });
  }

  getMelody() {    
    return this.melody
  }

  getChordProgression() {
    return this.chordProgression;
  }

  getInstrumentChord(){
    return this.instNumChord[this.instChord];
  }

  getInstrumentMelody() {
    return this.instNumMelody[this.instMelody];
  }

  getTempo() {
    this.tempo = 78;
    return this.tempo;
  }

  random(arr) {
    return Math.floor(Math.random() * arr.length);
  }
}

module.exports = MusicGenerator;