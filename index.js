const MusicGenerator = require('./src/music_generator');
const midi = require('./custom-modules/midi');
const Const = require('./src/music_constant');
const express = require('express')
const app = express()

// app.get('/', (req, res) => {
var InstrumentChordName = ['piano', 'elec piano', 'syn', 'guitar nylon', 'guitar steel', 'viola', 'cello'];
var InstrumentMelodyName = ['piano', 'elec piano', 'syn', 'violin', 'flute', 'guitar nylon', 'guitar steel'];

var music = new MusicGenerator();

music.setFacts({
  init: {
    // KeySignature: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F'],
    KeySignature: 'C',
    // Tempo: { min: 60, max: 80 },
    Tempo: 79,
    // InstrumentMelody: [1, 3, 93, 41, 74, 25, 26],
    // InstrumentChord: [1, 3, 93, 25, 26, 42, 43],
    InstrumentMelody: 41,
    InstrumentChord: 42,
  },
  songPart: {
    pattern: [
      ['Intro', 'Verse', 'Chorus', 'Outro']
    ],
    TotalBarPerPart: 1
  },
  chordProgressive: {
    Intro: {
      chord: ['I', 'IV'],
      cadence: ['V'],
      phase: 4,
      rhythm: 1
    },
    Verse: {
      chord: ['I', 'vi', 'ii', 'IV'],
      cadence: ['', 'V'],
      phase: 2,
      rhythm: 2
    },
    Chorus: {
      chord: ['I', 'vi', 'IV', 'V'],
      cadence: [''],
      phase: 2,
      rhythm: 4
    },
    Outro: {
      chord: ['I', 'IV', 'I', 'IV', 'I'],
      cadence: [''],
      phase: 1,
      rhythm: 1
    },
  },
  melody: {
    motif: [{
      notes: [0, 0, 1, 1],
      pattern: 'xx' + Const.n1 + Const.n2 + '__'
    }, {
      notes: [0, 1, 1],
      pattern: 'x_x_x_'
    }]
  }
});

music.runEngine().then(() => {
  // app.get('/', (req, res) => {
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
    // midi(music, 'song/test_r+10.mid', 10);
  // });


  // midi(music, 'song/test_r_10.mid', -10);
  // app.listen(3000, () => {
  //     console.log('Example app listening on port 3000! 111')
  // })
});

// });
