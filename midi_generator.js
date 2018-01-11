const jsmidgen = require('jsmidgen');
const fs = require('fs');

class MidiGenerator {

  constructor(music) {
    this.file = new jsmidgen.File();
    this.track = new jsmidgen.Track();
    this.file.addTrack(this.track);
    this.music = music;
  }

  createChordProgression(){
    for (let chord of this.music.getChordProgressionNote()){
      // this.createChord(chord);
      this.track.addChord(0, chord, 128*4);
      this.track.addNote(1, 'c5', 128);
      this.track.addNote(1, 'c5', 128);
      this.track.addNote(1, 'c5', 128);
      this.track.addNote(1, 'c5', 128);
    }
  }

  createChord(chord) {
    for(let i in chord){
      if(i==0)
        this.track.addNoteOn(0, chord[i], 0);
      else
        this.track.addNoteOn(0, chord[i]);        
    }
    for (let i in chord) {
      if (i == 0)
        this.track.addNoteOff(0, chord[i], 128*4);
      else
        this.track.addNoteOff(0, chord[i]);
    }
  }

  createFile() {
    fs.writeFileSync('song/test.mid', this.file.toBytes(), 'binary');
  }
}

module.exports = MidiGenerator;