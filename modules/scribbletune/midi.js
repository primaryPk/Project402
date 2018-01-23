'use strict';

const fs = require('fs');
const assert = require('assert');
const jsmidgen = require('../jsmidgen');
const transpose = require('./transpose');

/**
 * Take an array of note objects to generate a MIDI file in the same location as this method is called
 * @param  {Array} notes    Notes are in the format: {note: ['c3'], level: 127, length: 64}
 * @param  {String} fileName If a filename is not provided, then `music.mid` is used by default
 */
const midi = (music, binuaral, fileName) => {
	let melodies = music.getMelody();
	let chords = music.getChordProgression();

	assert(Array.isArray(melodies), 'You must provide an array of notes to write!');
	assert(Array.isArray(chords), 'You must provide an array of chords to write!');

	fileName = fileName || 'music.mid';
	let file = new jsmidgen.File();


	let track_left_melody = new jsmidgen.Track();
	file.addTrack(track_left_melody);
	track_left_melody.setTempo(music.getTempo())
	track_left_melody.setInstrument(0, music.getInstrumentMelody());
	if (binuaral)
		track_left_melody.setPan(0, 0); // L

	melodies.forEach((noteObj) => {
		let level = noteObj.level || 127;
		// While writing chords (multiple notes per tick)
		// only the first noteOn (or noteOff) needs the complete arity of the function call
		// subsequent calls need only the first 2 args (channel and note)
		if (noteObj.note) {
			// Transpose the note to the correct middle C (in case middle C was changed)
			noteObj.note = transpose.transposeNote(noteObj.note);
			if (typeof noteObj.note === 'string') {
				track_left_melody.noteOn(0, noteObj.note, noteObj.length, level); // channel, pitch(note), length, velocity
				track_left_melody.noteOff(0, noteObj.note, noteObj.length, level);
			} else {
				track_left_melody.addChord(0, noteObj.note, noteObj.length, level);
			}
		} else {
			track_left_melody.noteOff(0, '', noteObj.length);
		}
	});

	let track_left_chord = new jsmidgen.Track();
	file.addTrack(track_left_chord);
	track_left_chord.setTempo(music.getTempo())
	track_left_chord.setInstrument(1, music.getInstrumentChord());
	if (binuaral)
		track_left_chord.setPan(1, 0); // L
	chords.forEach((noteObj) => {
		let level = noteObj.level || 127;
		if (noteObj.note) {
			noteObj.note = transpose.transposeNote(noteObj.note);
			if (typeof noteObj.note === 'string') {
				track_left_chord.noteOn(1, noteObj.note, noteObj.length, level);
				track_left_chord.noteOff(1, noteObj.note, noteObj.length, level);
			} else {
				track_left_chord.addChord(1, noteObj.note, noteObj.length, level);
			}
		} else {
			track_left_chord.noteOff(1, '', noteObj.length);
		}
	});

	if (binuaral) {
		let track_right_melody = new jsmidgen.Track();
		file.addTrack(track_right_melody);
		track_right_melody.setTempo(music.getTempo())
		track_right_melody.setInstrument(2, music.getInstrumentMelody());
		// track_right_melody.setBlend(2, 125, 83);
		track_right_melody.setBlend(2, 127, 0);
		track_right_melody.setPan(2, 127); // R

		melodies.forEach((noteObj) => {
			let level = noteObj.level || 127;
			if (noteObj.note) {
				noteObj.note = transpose.transposeNote(noteObj.note);
				if (typeof noteObj.note === 'string') {
					track_right_melody.noteOn(2, noteObj.note, noteObj.length, level);
					track_right_melody.noteOff(2, noteObj.note, noteObj.length, level);
				} else {
					track_right_melody.addChord(2, noteObj.note, noteObj.length, level);
				}
			} else {
				track_right_melody.noteOff(2, '', noteObj.length);
			}
		});

		let track_right_chord = new jsmidgen.Track();
		file.addTrack(track_right_chord);
		track_right_chord.setTempo(music.getTempo())
		track_right_chord.setInstrument(3, music.getInstrumentChord());
		track_right_chord.setBlend(3, 127, 0);
		track_right_chord.setPan(3, 127); // R

		chords.forEach((noteObj) => {
			let level = noteObj.level || 127;
			if (noteObj.note) {
				noteObj.note = transpose.transposeNote(noteObj.note);
				if (typeof noteObj.note === 'string') {
					track_right_chord.noteOn(3, noteObj.note, noteObj.length, level);
					track_right_chord.noteOff(3, noteObj.note, noteObj.length, level);
				} else {
					track_right_chord.addChord(3, noteObj.note, noteObj.length, level);
				}
			} else {
				track_right_chord.noteOff(3, '', noteObj.length);
			}
		});
	}
	
	fs.writeFileSync(fileName, file.toBytes(), 'binary');
}

module.exports = midi;