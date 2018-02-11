const MusicGenerator = require('./src/music_generator');
// const scribble = require('scribbletune');
const midi = require('./custom-modules/midi');
const Const = require('./src/music_constant');
// const express = require('express')
// const app = express()

// app.get('/', (req, res) => {

var music = new MusicGenerator();

music.setFacts({
  init:{
    KeySignature: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F'],
    // KeySignature: 'C',
    Tempo: { min: 60, max: 80 },
    InstrumentMelody: [1, 3, 93, 41, 42, 43, 74, 69, 72],
    InstrumentChord: [1, 3, 93, 25, 26],
    // InstrumentMelody: 1,
    // InstrumentChord: 1,
  },
  songPart: {
    pattern: [
      ['Intro', 'Verse', 'Chorus', 'Outro'],
      ['A', 'A', 'B', 'A']
    ],
    TotalBarPerPart : 1
  },
  chordProgressive: {
    main: {
      pattern: Const.n4.repeat(4),
      chordChunk: ['I', 'IV', 'V', 'I'],
      loop: 1
    },
    Intro: {
      pattern: Const.n2.repeat(8),
      chordChunk: ['I', 'vi', 'IV', 'V'],
    },
    Verse: {
      pattern: 'x_______________'.repeat(4),
      chordChunk: ['I', 'V', 'vi', 'I']
    },
    PreChorus: null,
    Chorus: {
      pattern: Const.n2.repeat(2) + Const.n1 + Const.n1 + Const.n2 + Const.n1 + '__x_' + Const.n2 + Const.n3 + Const.n1,
      chordChunk: ['I', 'I', 'IV', 'IV', 'I', 'V', 'V', 'V', 'I', 'V']
    }, 
    Bridge: null,
    Outro: {
      pattern: 'x_______________'.repeat(4),
      chordChunk: ['I', 'V', 'vi', 'iii']
    },    
  },
  melody: {
    passingtone: false,
    //tick: [true, false, true, false],
    lastBar: {
      pattern: [Const.n2.repeat(2), Const.n1 + Const.n3]
    }
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
  console.log(music.song_part);
  console.log(music.lastbar);
  
  
  midi(music, 'song/test.mid');
  // midi(music, 'song/test_r+10.mid', 10);
  // midi(music, 'song/test_r_10.mid', -10);
});

// });

// app.listen(3000, () => {
//     console.log('Example app listening on port 3000! 111')
// })