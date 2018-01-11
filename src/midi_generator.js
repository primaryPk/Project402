const jsmidgen = require('jsmidgen');
const fs = require('fs');

class MidiGenerator {

  constructor(music) {
    this.music = music;
    this.file = new jsmidgen.File();
  }
  
  createMelody() {
    this.melody_track = new jsmidgen.Track();
    this.file.addTrack(this.melody_track);
    
    this.melody_track.setInstrument(0, this.music.instNumMelody[this.music.instMelody])
    for (let note of this.music.getMelody()) {
      this.melody_track.addNote(0, note.pitch, 128 * note.duration, 0, note.velocity);
    }
  }
  
  createChordProgression() {
    this.chord_track = new jsmidgen.Track();
    this.file.addTrack(this.chord_track);

    this.chord_track.setInstrument(1, this.music.instNumChord[this.music.instChord])
    for (let chord of this.music.getChordProgressionNote()) {
      this.chord_track.addChord(1, chord, 128 * 4);
    }
  }

  createFile() {
    fs.writeFileSync('song/test.mid', this.file.toBytes(), 'binary');
  }
}

module.exports = MidiGenerator;