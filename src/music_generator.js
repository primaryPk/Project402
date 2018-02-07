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
    this.instMelody = 7;
    this.instChord = 3;
    // console.log("Chord: " + this.instNameChord[this.instChord]);
    // console.log("Melody: " + this.instNameMelody[this.instMelody]);
    
  }

  composeMelody(){
    let n4 = 'x_______________';
    let n2 = 'x_______';
    let n1 = 'x___';

    this.melody = scribble.clip({
      notes: ['c5', 'd5', 'e5', 'c5', 'g5', 
              'f5', 'e5', 'd5', 'c5', 'd5', 'd5', 'e5',
              'f5', 'a4', 'b4', 'c5',
            ],
      pattern: 'x_'.repeat(2) + 'xxx_________'
            + 'x_'.repeat(2) + 'xxx_____' + 'x_'.repeat(2)
            + n2 + n1 + n1 + n4
      // pattern: n1.repeat(16)
    });
  }
  
  composeChordProgreesion(){
    let n4 = 'x_______________';
    let n2 = 'x_______';
    let n1 = 'x___';
    this.chordProgression = scribble.clip({
      notes: [
        'Cmaj', 'Cmaj', 'Cmaj', 
        'Fmaj', 'Fmaj', 'Fmaj',
        'Dmin', 'Gmaj', 'Cmaj'
      ],
      pattern: (n2 + 'x_' + 'x_____').repeat(2) + 'x___________' + n1 + n4,
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