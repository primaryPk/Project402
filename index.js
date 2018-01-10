const express = require('express')
const app = express()
const MusicGenerator = require('./music_generator');

app.get('/', (req, res) => {
    var gen = new MusicGenerator("asd111boatttt");
    
    res.send(gen.getX() + "");
})

app.listen(3000, () => {
    console.log('Example app listening on port 3000! eiei')
})