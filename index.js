const MusicGenerator = require('./src/music_generator');
// const scribble = require('scribbletune');
const midi = require('./custom-modules/midi');
// const express = require('express')
// const app = express()

// app.get('/', (req, res) => {

var music = new MusicGenerator();
music.composeMelody();
music.composeChordProgreesion();

// midi(music, 'song/chord_' + music.instNameMelody[music.instMelody] + '.mid');
// midi(music, 'song/chord.mid');
midi(music, 'song/test.mid');
midi(music, 'song/test_r+10.mid', 10);
midi(music, 'song/test_r_10.mid', -10);
// midi(music, 'song/test_bi_r-10_' + music.instNameMelody[music.instMelody] +'.mid', -10);
// midi(music, 'song/test.mid');


// var midi = new midiGenerator(music);
// midi.createMelody();
// midi.createChordProgression();
// midi.createFile();

// });

// app.listen(3000, () => {
//     console.log('Example app listening on port 3000! 111')
// })