const jsmidgen = require('jsmidgen');

jsmidgen.Track.prototype.setBlend = jsmidgen.Track.prototype.blend = function (channel, msb, lsb) {
    this.events.push(new jsmidgen.Event({
      type: jsmidgen.Event.PITCH_BEND,
      channel: channel,
      param1: lsb,
      param2: msb
    }));
    return this;
  };

jsmidgen.Track.prototype.setPan = jsmidgen.Track.prototype.pan = function (channel, pan) {
  this.events.push(new jsmidgen.Event({
    type: jsmidgen.Event.CONTROLLER,
    channel: channel,
    param1: 0x0A,
    param2: pan
  }));
  return this;
};

module.exports = jsmidgen;

