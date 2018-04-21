const MusicGenerator = require('./src/music_generator');
const midi = require('./custom-modules/midi');
const Const = require('./src/music_constant');
const Instrument = require('./src/instrument_range');
const fs = require('fs'); 
const express = require('express')
const app = express()

var music = new MusicGenerator();

const chord = [
  ['I', 'vi', 'IV', 'V'],
  ['ii', 'V', 'I', 'IV'],
  ['vi', 'V', 'IV', 'V'],
  ['I', 'ii', 'vi', 'IV'],
  ['I', 'iii', 'vi', 'IV'],
  ['I', 'iii', 'ii', 'IV'],
  ['I', 'ii', 'iii', 'IV'],
  ['I', 'ii', 'vi', 'IV'],
  ['I', 'IV', 'I', 'IV'],
  ['I', 'I', 'IV', 'IV'],
  ['IV', 'I', 'IV', 'I'],
  ['IV', 'I', 'IV', 'V'],
  ['I', 'vi', 'ii', 'IV']
]

music.setFacts({
  init: {
    KeySignature: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F'],
    // KeySignature: 'C',
    Tempo: { min: 60, max: 80 },
    // Tempo: 79,
    InstrumentMelody: [1, 3, 93, 41, 74, 25, 26],
    InstrumentChord: [1, 3, 93, 25, 26, 42, 43],
    // InstrumentMelody: 41,
    // InstrumentChord: 42,
  },
  songPart: {
    pattern: [
      ['Intro', 'Verse', 'Chorus', 'Outro']
    ],
  },
  chordProgressive: {
    Intro: {
      chord: [
        ['I', 'IV'],
        ['IV', 'I'],
        ['I', 'V'],
        ['V', 'I'],
        ['ii', 'V', 'I', 'IV'],
        ['I', 'vi', 'ii', 'IV']        
      ],
      cadence: ['V'],
      phase: 4,
      rhythm: 1
    },
    Verse: {
      chord: chord,
      cadence: ['', 'V'],
      phase: 2,
      rhythm: 2
    },
    Chorus: {
      chord: chord,
      cadence: [''],
      phase: 2,
      rhythm: 4
    },
    Outro: {
      chord: chord.map(e => {
        let x = e.slice(0);
        x.push('I');
        return x;
      }),
      cadence: [''],
      phase: 1,
      rhythm: 1
    },
  },
  melody: {
    motif: [
      { notes: [0, 0, 1, 1], pattern: 'x_x_x_x_' }, 
      { notes: [0, 1, 0, -1], pattern: 'x_x_x_x_' }, 
      { notes: [0, 1, 1, 1], pattern: 'x_x_x_x_' }, 
      { notes: [0, 1, -1, 0], pattern: 'x_x_x_x_' }, 
      { notes: [0, 1, 1], pattern: 'x_x_x_' }, 
      { notes: [0, 1, -1], pattern: 'x_x_x_' }, 
      { notes: [0, 1, 0], pattern: 'x_x_x_' }, 
      { notes: [0, 0, 1], pattern: 'x_x_x_' }, 
      { notes: [0, 2, -1], pattern: 'x_x_x_' }, 
      { notes: [0, 0], pattern: 'x_x_' }, 
      { notes: [0, 1], pattern: 'x_x_' }, 
      { notes: [0, 2], pattern: 'x_x_' },
    ]
  }
});

music.runEngine().then(() => {
  // app.get('/', (req, res) => {
  // for (let i = 0; i < 1000; i++) {    
    music.init();
  
    music.composeChordProgreesion();
    music.composeMelody();

    let file = 'song/ver24 complete1/'
      + music.getKeySig() + ' ' + music.getMotif() + ' '
      + music.getTempo() + ' '
      + Instrument[music.getInstrumentMelody()].name + ' '
      + Instrument[music.getInstrumentChord()].name + ' '
      + music.getSimpleChordProgression();

    let count = 0;
    while (1) {
      let version = '';
      if (count != ''){
        version = ' ('+count+')';
      }
      let exist = fs.existsSync(file + version + '.mid');
      if (exist) {
        if (count == ''){
          count = 0;
        }
        count ++;
      } else {
        midi(music, file + version + '.mid');
        break;
      } 
    }

      
  // }
  // midi(music, 'song/test_r+10.mid', 10);
  // });


  // midi(music, 'song/test_r_10.mid', -10);
  // app.listen(3000, () => {
  //     console.log('Example app listening on port 3000! 111')
  // })
});

// });