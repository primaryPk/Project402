// const fs = require('fs');
const _ = require('lodash');
// const Const = require('./music_constant');
// const Util = require('./util');

class Velocity {

  constructor(){
    this.song_part = null;
    this.chordProgressive = null;
    this.ruleMelody = {
      Intro: { min: 80, max: 90 },
      Verse: { min: 90, max: 100 },
      PreChorus: { min: 100, max: 110 },
      Chorus: { min: 100, max: 120 },
      // Bridge: { min: xx, max: xx },
      Outro: { min: 80, max: 90 }
    };

    this.ruleChord = { min: 50, max: 75 };
  }

  setSongpart(song_part){
    this.song_part = song_part;
  }

  setChordProgressive(chordProgressive){
    this.chordProgressive = chordProgressive;    
  }

  generateVelocityMelody(melody){
    this.preGenerate();
    // console.log(melody);

    let new_melody = Array(this.len.length).fill(null).map(v => []);
    let i = 0;
    let sum = 0;

    melody.forEach(note => {
      new_melody[i].push(note);
      sum += Number(note.length)
      if (sum == this.len[i]){
        i++;
        sum = 0;
      }
    });

    this.song_part.forEach((part, idx) => {
      let min = this.ruleMelody[part].min;
      let max = this.ruleMelody[part].max;
      new_melody[idx].map(notes => {
        notes.level = Array(notes.note.length).fill(0).map(v => this.randomVelocity(min, max));
        return notes
      })
    });

    new_melody = _.flatten(new_melody);
    
    return new_melody;
  }

  generateVelocityChord(chords) {
    let min = this.ruleChord.min;
    let max = this.ruleChord.max;
    chords = chords.map(chord => {
      chord.level = Array(chord.note.length).fill(0).map(v => this.randomVelocity(min, max));
      return chord;
    });
    return chords;
  }
  
  preGenerate(){
    this.len = this.song_part.map(part => {
      return this.chordProgressive[part].pattern.length * 32
    });
  }

  randomVelocity(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}

module.exports = Velocity;