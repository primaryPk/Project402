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
  }

  getMelody() {
    return ["a4", 'c4']
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
    return this.tempo;
  }

  random(arr) {
    return Math.floor(Math.random() * arr.length);
  }
}

module.exports = MusicGenerator;