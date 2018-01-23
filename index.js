// const express = require('express')
// const app = express()
const MusicGenerator = require('./src/music_generator');
const midiGenerator = require('./src/midi_generator');
const scribble = require('./modules/scribbletune');

// app.get('/', (req, res) => {

var music = new MusicGenerator();
music.composeMelody();
music.composeChordProgreesion();

scribble.midi(music, true, 'song/test_bi.mid');
scribble.midi(music, false, 'song/test.mid');

// var midi = new midiGenerator(music);
// midi.createMelody();
// midi.createChordProgression();
// midi.createFile();

// });

// app.listen(3000, () => {
//     console.log('Example app listening on port 3000! 111')
// })