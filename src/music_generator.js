const scribble = require('../modules/scribbletune');
const Note = require('./note')
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
    // this.instMelody = 0;
    this.instChord = this.random(this.instNumChord);
    // this.instChord = 2;
    console.log("Chord: " + this.instNameChord[this.instChord]);
    console.log("Melody: " + this.instNameMelody[this.instMelody]);
    
  }

  composeMelody(){
    // this.melody.push(new Note('c5', 0.5, 70));
    // this.melody.push(new Note('c5', 0.5, 70));
    // this.melody.push(new Note('d5', 1, 70));
    // this.melody.push(new Note('e5', 2, 70));
    
    // this.melody.push(new Note('f5', 1, 70));
    // this.melody.push(new Note('f5', 1, 70));
    // this.melody.push(new Note('d5', 1, 70));
    // this.melody.push(new Note('c5', 1, 70));
    
    // this.melody.push(new Note('e5', 1, 70));
    // this.melody.push(new Note('e5', 0.5, 70));
    // this.melody.push(new Note('g5', 0.5, 70));
    // this.melody.push(new Note('a5', 0.5, 70));
    // this.melody.push(new Note('b5', 1, 70));
    // this.melody.push(new Note('c6', 0.5, 70));
    
    // this.melody.push(new Note('c6', 0.5, 70));
    // this.melody.push(new Note('b5', 0.25, 70));
    // this.melody.push(new Note('a5', 0.25, 70));
    // this.melody.push(new Note('g5', 0.5, 70));
    // this.melody.push(new Note('f5', 0.5, 70));
    // this.melody.push(new Note('e5', 0.5, 70));
    // this.melody.push(new Note('d5', 0.5, 70));
    // this.melody.push(new Note('c5', 0.5, 70));
    // this.melody.push(new Note('c5', 0.5, 70));
    
    // this.melody.push(new Note('c5', 0.5, 70));
    // this.melody.push(new Note('c5', 0.5, 70));
    // this.melody.push(new Note('d5', 1, 70));
    // this.melody.push(new Note('e5', 2, 70));
    
    // this.melody.push(new Note('f5', 1, 70));
    // this.melody.push(new Note('f5', 1, 70));
    // this.melody.push(new Note('d5', 1, 70));
    // this.melody.push(new Note('c5', 1, 70));
    
    // this.melody.push(new Note('e5', 1, 70));
    // this.melody.push(new Note('e5', 0.5, 70));
    // this.melody.push(new Note('g5', 0.5, 70));
    // this.melody.push(new Note('a5', 0.5, 70));
    // this.melody.push(new Note('b5', 1, 70));
    // this.melody.push(new Note('c6', 0.5, 70));
    
    // this.melody.push(new Note('b5', 0.5, 70));
    // this.melody.push(new Note('a5', 0.5, 70));
    // this.melody.push(new Note('g5', 1, 70));
    // this.melody.push(new Note('e5', 2, 70));
    
    
    // พรีมต้องแต่งตรงนี้ ตรงนี้ ยัง hardcode อยู่
    this.melody = scribble.clip({
      notes: ['c4', 'd4', 'e4', 'e4', 'c4'],
      pattern: 'x___'.repeat(32),
      accentMap: 'x___x___'
    });
  }
  
  composeChordProgreesion(){
    // พรีมต้องแต่งตรงนี้ ตรงนี้ ยัง hardcode อยู่
    this.chordProgression = scribble.clip({
      notes: ['Cmaj', 'Fmaj', 'Gmaj', 'Cmaj'],
      pattern: 'x_______________'.repeat(8),
      sizzle: true
    });
  }

  getMelody() {    
    return this.melody
  }

  getChordProgression() {
    // นำ chordProgression ที่เป็น Array ของตัวเลข มาแปลงเป็น ตัวโน้ต ตามคอร์ด
    // return [
    //   ["c3", "e3", "g3", "c4"],
    //   ["f3", "a3", "c3", "f4"],
    //   ["g3", "b3", "d3", "g4"],
    //   ["c3", "e3", "g3", "c4"],
    //   ["c3", "e3", "g3", "c4"],
    //   ["f3", "a3", "c3", "f4"],
    //   ["g3", "b3", "d3", "g4"],
    //   ["c3", "e3", "g3", "c4"],
    // ]

    return this.chordProgression;
  }

  getInstrumentChord(){
    return this.instNumChord[this.instChord];
  }

  getInstrumentMelody() {
    return this.instNumMelody[this.instMelody];
  }

  getTempo() {
    return this.tempo;
  }

  random(arr) {
    return Math.floor(Math.random() * arr.length);
  }
}

module.exports = MusicGenerator;