const MusicGenerator = require('./src/music_generator');
// const scribble = require('scribbletune');
const midi = require('./custom-modules/midi');
const Const = require('./src/music_constant');
// const express = require('express')
// const app = express()

// app.get('/', (req, res) => {
var InstrumentChordName = ['piano', 'elec piano', 'syn', 'guitar nylon', 'guitar steel', 'cello', 'viola'];
var InstrumentMelodyName = ['piano', 'elec piano', 'syn', 'violin', 'flute', 'guitar nylon', 'guitar steel'];

var music = new MusicGenerator();

music.setFacts({
  init: {
    // KeySignature: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F'],
    KeySignature: 'E',
    // Tempo: { min: 60, max: 80 },
    Tempo: 79,
    // InstrumentChord: [1, 3, 93, 25, 26, 42,, 43],
    // InstrumentMelody: [1, 3, 93, 41, 74, 25, 26],
    InstrumentChord: 1,
    InstrumentMelody: 1,
  },
  songPart: {
    pattern: [
      ['Intro', 'Verse', 'Chorus', 'Outro']
    ],
    TotalBarPerPart: 1
  },
  chordProgressive: {
    main: {
      pattern: Const.n4.repeat(4),
      chordChunk: ['I', 'IV', 'V', 'I'],
      loop: 1
    },
    Intro: {
      // pattern: Const.n2.repeat(8),
      // chordChunk: ['I', 'vi', 'IV', 'V'],
      pattern: Const.n4.repeat(5),
      chordChunk: ['I', 'IV', 'I', 'IV', 'I'],
      sentence: 2
    },
    Verse: {
      // pattern: 'x_______________'.repeat(4),
      // chordChunk: ['I', 'V', 'vi', 'I']
      pattern: Const.n2.repeat(16),
      chordChunk: ['I', 'I', 'vi', 'vi', 'ii', 'ii', 'IV', 'IV', 
                   'I', 'I', 'vi', 'vi', 'ii', 'ii', 'IV', 'IV'],
      sentence: 2
    },
    PreChorus: null,
    Chorus: {
      // pattern: Const.n2.repeat(2) + Const.n1 + Const.n1 + Const.n2 + Const.n1 + '__x_' + Const.n2 + Const.n3 + Const.n1,
      // chordChunk: ['I', 'I', 'IV', 'IV', 'I', 'V', 'V', 'V', 'I', 'V']
      pattern: Const.n1.repeat(16),
      chordChunk: ['I', 'I', 'I', 'I', 'vi', 'vi', 'vi', 'vi', 'IV', 'IV', 'IV', 'IV', 'V', 'V', 'V', 'V'],
      sentence: 1      
    },
    Bridge: null,
    Outro: {
      // pattern: 'x_______________'.repeat(4),
      // chordChunk: ['I', 'V', 'vi', 'iii']
      pattern: Const.n4.repeat(5),
      chordChunk: ['I', 'IV', 'I', 'IV', 'I'],
      // chordChunk: ['V', 'I', 'V', 'I', 'V', 'I', 'V', 'I', 'V', 'IV', 'I']
      sentence: 1
    },
  },
  melody: {
    passingtone: false,
    tick: [1, 0, 1, 0],
    lastBar: {
      pattern: [
        // Const.n4, 
        // Const.n2.repeat(2),
        // Const.n1 + Const.n3
        'x_'.repeat(2) + Const.n1 + Const.n2
      ],
      chord: 'I'
    },
    motif: [{
      notes: [0, 0, 1, 1],
      pattern: 'xx' + Const.n1 + Const.n2 + '__'
    }, {
      notes: [2, 2, -2],
      pattern: 'x_x_x_'
    }]
  }
});

music.runEngine().then(() => {
  music.init();

  music.composeChordProgreesion();
  music.composeMelody();

  // console.log(music.key);
  // console.log(notes);
  // console.log(chords);
  // console.log(music.song_part);
  // console.log(music.lastbar);
  // console.log(music.motif);

  // console.log(music.getChordProgression());
  // console.log(music.getMelody());


  midi(music, 'song/test.mid');
  midi(music, 'song/test_r+10.mid', 10);
  // midi(music, 'song/test_r_10.mid', -10);
});

// });

// app.listen(3000, () => {
//     console.log('Example app listening on port 3000! 111')
// })