// const express = require('express')
// const app = express()
const MusicGenerator = require('./src/music_generator');
const midiGenerator = require('./src/midi_generator');

// app.get('/', (req, res) => {

var music = new MusicGenerator();
music.composeMelody();

var midi = new midiGenerator(music);
midi.createMelody();
midi.createChordProgression();
midi.createFile();

// });

// app.listen(3000, () => {
//     console.log('Example app listening on port 3000! 111')
// })