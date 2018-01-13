class Note {

  constructor(pitch, duration, velocity = 64) {
    this.pitch = pitch;
    this.duration = duration;
    this.velocity = velocity;
  }
  
}

module.exports = Note;