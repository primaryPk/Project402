const MusicGenerator = require('./src/music_generator');
// const scribble = require('scribbletune');
const midi = require('./custom-modules/midi');
// const express = require('express')
// const app = express()

// app.get('/', (req, res) => {

var music = new MusicGenerator();

music.setFacts({
  init:{
    //KeySignature: ['C', 'B', 'D', 'Db'],
    KeySignature: 'C',
    Tempo: { min: 60, max: 80 },
    TimeSignature: '4/4',
    // InstrumentMelody: [1, 3, 93, 41, 42, 43, 74, 69, 72],
    // InstrumentChord: [1, 3, 93, 25, 26]
    InstrumentMelody: 1,
    InstrumentChord: 1
  },
  chordProgressive: {
    pattern: 'x_______________',
    chordChunk: ['I', 'IV', 'V', 'I']
  },
  melody: {
    passingtone: false
  }
});

music.runEngine().then(() => {
  music.init();
  let notes = music.generateNoteFromKey(music.key, music.scale);
  let chords = music.generateChordFromNote(notes);
  
  music.composeChordProgreesion(chords, 1);
  music.composeMelody(notes);
  
  console.log(music.key);
  console.log(notes);
  console.log(chords);
  
  
  midi(music, 'song/test.mid');
  // midi(music, 'song/test_r+10.mid', 10);
  // midi(music, 'song/test_r_10.mid', -10);
});

// });

// app.listen(3000, () => {
//     console.log('Example app listening on port 3000! 111')
// })