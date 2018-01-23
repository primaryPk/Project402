const Note = require('./note')

class MusicGenerator {

  constructor() {
    this.melody = [];
    this.chordProgression = [];

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
    this.instMelody = 3;
    console.log("Chord: " + this.instNameChord[this.instChord]);
    console.log("Melody: " + this.instNameMelody[this.instMelody]);
    
  }

  composeMelody(){
    // พรีมต้องแต่งตรงนี้ ตรงนี้ ยัง hardcode อยู่
    this.melody.push(new Note('c5', 0.5, 70));
    this.melody.push(new Note('c5', 0.5, 70));
    this.melody.push(new Note('d5', 1, 70));
    this.melody.push(new Note('e5', 2, 70));

    this.melody.push(new Note('f5', 1, 70));
    this.melody.push(new Note('f5', 1, 70));
    this.melody.push(new Note('d5', 1, 70));
    this.melody.push(new Note('c5', 1, 70));

    this.melody.push(new Note('e5', 1, 70));
    this.melody.push(new Note('e5', 0.5, 70));
    this.melody.push(new Note('g5', 0.5, 70));
    this.melody.push(new Note('a5', 0.5, 70));
    this.melody.push(new Note('b5', 1, 70));
    this.melody.push(new Note('c6', 0.5, 70));

    this.melody.push(new Note('c6', 0.5, 70));
    this.melody.push(new Note('b5', 0.25, 70));
    this.melody.push(new Note('a5', 0.25, 70));
    this.melody.push(new Note('g5', 0.5, 70));
    this.melody.push(new Note('f5', 0.5, 70));
    this.melody.push(new Note('e5', 0.5, 70));
    this.melody.push(new Note('d5', 0.5, 70));
    this.melody.push(new Note('c5', 0.5, 70));
    this.melody.push(new Note('c5', 0.5, 70));

    this.melody.push(new Note('c5', 0.5, 70));
    this.melody.push(new Note('c5', 0.5, 70));
    this.melody.push(new Note('d5', 1, 70));
    this.melody.push(new Note('e5', 2, 70));

    this.melody.push(new Note('f5', 1, 70));
    this.melody.push(new Note('f5', 1, 70));
    this.melody.push(new Note('d5', 1, 70));
    this.melody.push(new Note('c5', 1, 70));

    this.melody.push(new Note('e5', 1, 70));
    this.melody.push(new Note('e5', 0.5, 70));
    this.melody.push(new Note('g5', 0.5, 70));
    this.melody.push(new Note('a5', 0.5, 70));
    this.melody.push(new Note('b5', 1, 70));
    this.melody.push(new Note('c6', 0.5, 70));

    this.melody.push(new Note('b5', 0.5, 70));
    this.melody.push(new Note('a5', 0.5, 70));
    this.melody.push(new Note('g5', 1, 70));
    this.melody.push(new Note('e5', 2, 70));

    // this.melody.push(new Note('c5', 4, 70));
    // this.melody.push(new Note('d5', 1, 70));
    // this.melody.push(new Note('e5', 1, 70));
    // this.melody.push(new Note('f5', 1, 70));

  }

  getMelody() {    
    return this.melody
  }

  getChordProgression() {
    return [1, 4, 5, 1, 1, 4, 5, 1]
  }

  getChordProgressionNote() {
    // นำ chordProgression ที่เป็น Array ของตัวเลข มาแปลงเป็น ตัวโน้ต ตามคอร์ด
    return [
      ["c3", "e3", "g3", "c4"],
      ["f3", "a3", "c3", "f4"],
      ["g3", "b3", "d3", "g4"],
      ["c3", "e3", "g3", "c4"],
      ["c3", "e3", "g3", "c4"],
      ["f3", "a3", "c3", "f4"],
      ["g3", "b3", "d3", "g4"],
      ["c3", "e3", "g3", "c4"],
    ]
  }

  getTempo() {
    this.tempo = 80;
    return this.tempo;
  }

  random(arr) {
    return Math.floor(Math.random() * arr.length);
  }
}

module.exports = MusicGenerator;