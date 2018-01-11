// const express = require('express')
// const app = express()
const MusicGenerator = require('./music_generator');
const midiGenerator = require('./midi_generator');
const Binuaralbeats = require('./binauralbeats');

// app.get('/', (req, res) => {
var music = new MusicGenerator();
var midi = new midiGenerator(music);
midi.createChordProgression();
midi.createFile();
// var bi = new Binuaralbeats();

// res.send(gen.getX() + "primeeeeeeee");
// })

// app.listen(3000, () => {
//     console.log('Example app listening on port 3000! 111')
// })