const jsmidgen = require('../modules/jsmidgen');
const fs = require('fs');

class MidiGenerator {

  constructor(music) {
    this.music = music;
    this.file = new jsmidgen.File();
    
  }
  
  createMelody() {
    this.melody_track = new jsmidgen.Track();
    this.file.addTrack(this.melody_track);    
    this.melody_track.setTempo(this.music.getTempo())
    this.melody_track.setInstrument(0, 42)
    this.melody_track.setBlend(0, 125, 83);
    this.melody_track.setPan(0, 127); // R

    this.melody_track1 = new jsmidgen.Track();
    this.file.addTrack(this.melody_track1);  
    this.melody_track1.setTempo(this.music.getTempo())     
    this.melody_track1.setInstrument(0, 42)
    this.melody_track1.setPan(0, 0); // L

    for (let note of this.music.getMelody()) {
      this.melody_track.addNote(0, note.pitch, 128 * note.duration, 0, note.velocity);
      this.melody_track1.addNote(0, note.pitch, 128 * note.duration, 0, note.velocity);
    }


  }
  
  createChordProgression() {
    // this.chord_track = new jsmidgen.Track();
    // this.file.addTrack(this.chord_track);

    // this.chord_track.setTempo(this.music.getTempo())    
    // this.chord_track.setInstrument(1, this.music.instNumChord[this.music.instChord])

    // for (let chord of this.music.getChordProgressionNote()) {
    //   this.chord_track.addChord(1, chord, 128 * 4);
    // }
  }

  createFile() {
    fs.writeFileSync('song/test.mid', this.file.toBytes(), 'binary');
  }
}

module.exports = MidiGenerator;