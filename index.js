const fs = require('fs')

// const express = require('express')
// const app = express()
const ffmpeg = require('fluent-ffmpeg');
const MusicGenerator = require('./src/music_generator');
const midiGenerator = require('./src/midi_generator');
const Binuaralbeats = require('./src/binauralbeats');

// app.get('/', (req, res) => {

var music = new MusicGenerator();
music.composeMelody();

var midi = new midiGenerator(music);
midi.createMelody();
midi.createChordProgression();
midi.createFile();

var bi = new Binuaralbeats(music);
bi.createWavFile();

var track = 'song/C5.mp3';//your path to source file

// ffmpeg(track)
//   .toFormat('wav')
//   .on('progress', function (progress) {
//     // console.log(JSON.stringify(progress));
//     console.log('Processing: ' + progress.targetSize + ' KB converted');
//   })
//   .on('end', function () {
//     console.log('Processing finished !');
//   })
//   .save('./song/C5.wav');


// res.send(gen.getX() + "primeeeeeeee");
// })

// app.listen(3000, () => {
//     console.log('Example app listening on port 3000! 111')
// })