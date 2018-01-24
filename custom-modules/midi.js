const fs = require('fs');
const assert = require('assert');
const jsmidgen = require('./jsmidgen');
const transpose = require('scribbletune/src/transpose');

const PAN_LEFT = 0;
const PAN_RIGHT = 127;

function noteToFrequency(n){
	return Math.pow(2, (n-69)/12) * 440;
}

function frequentToBlend(note, shift = 10){
	const BYTE = 128;
	const RANGE = BYTE*BYTE;
	const MIDDLE = RANGE / 2;

	let f = noteToFrequency(note+1) - noteToFrequency(note);

	let dunno = (shift / (f / RANGE)) + MIDDLE;

	let msb = Math.floor(dunno / BYTE);
	let lsb = Math.round(dunno - (msb * BYTE));

	return { msb: msb, lsb: lsb }
	
}

function generateTrack(channel, notes, tempo, instrument, pan, shift){
	let track = new jsmidgen.Track();
	track.setTempo(tempo)
	// track.setInstrument(channel, instrument);
	if (pan != null)
		track.setPan(channel, pan);

	notes.forEach((noteObj) => {
		let level = noteObj.level || 127;

		if (shift){
			let note = jsmidgen.Util.midiPitchFromNote(noteObj.note[0]);
			let blend = frequentToBlend(note, shift);
			
			track.setBlend(channel, blend.msb, blend.lsb);
		}

		if (noteObj.note) {
			if (noteObj.note.length > 1){
				track.addChord(channel, noteObj.note, noteObj.length, 50);
			} else {			
				track.addNote(channel, noteObj.note, noteObj.length, 0, 100);
			}
		} else {
			track.noteOff(channel, '', noteObj.length);
		}
	});

	return track
}

/**
 * Take an array of note objects to generate a MIDI file in the same location as this method is called
 * @param  {Array} notes    Notes are in the format: {note: ['c3'], level: 127, length: 64}
 * @param  {String} fileName If a filename is not provided, then `music.mid` is used by default
 */
const midi = (music, fileName, binuaral = 0) => {
	let melodies = music.getMelody();
	let chords = music.getChordProgression();

	assert(Array.isArray(melodies), 'You must provide an array of melodies to write!');
	assert(Array.isArray(chords), 'You must provide an array of chords to write!');

	fileName = fileName || 'music.mid';
	let file = new jsmidgen.File();

	if (binuaral == 0) {
		let melody = generateTrack(0, melodies, music.getTempo(), music.getInstrumentMelody());
		file.addTrack(melody);
		// let chord = generateTrack(1, chords, music.getTempo(), music.getInstrumentChord());
		// file.addTrack(chord);
	} else {		
		let track_left_melody = generateTrack(0, melodies, music.getTempo(), music.getInstrumentMelody(), PAN_LEFT);
		file.addTrack(track_left_melody); 
		// let track_left_chord = generateTrack(2, chords, music.getTempo(), music.getInstrumentChord(), PAN_LEFT);
		// file.addTrack(track_left_chord);

		let track_right_melody = generateTrack(1, melodies, music.getTempo(), music.getInstrumentMelody(), PAN_RIGHT, binuaral);
		file.addTrack(track_right_melody);
		// let track_right_chord = generateTrack(3, chords, music.getTempo(), music.getInstrumentChord(), PAN_RIGHT, binuaral);
		// file.addTrack(track_right_chord);
	}

	
	fs.writeFileSync(fileName, file.toBytes(), 'binary');
}

module.exports = midi;