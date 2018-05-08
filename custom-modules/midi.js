const fs = require('fs');
const assert = require('assert');
const jsmidgen = require('./jsmidgen');
const transpose = require('scribbletune/src/transpose');
const semitone = require('../config/music_constant').semitone;
const Util = require('../src/util');
const Note = (new(require('../src/note'))).generateNoteMajorScale();
const _ = require('lodash');

const PAN_LEFT = 0;
const PAN_RIGHT = 127;
const BYTE = 128;
const RANGE = BYTE * BYTE;
const MIDDLE = RANGE / 2;
// 2^7 midi = 200 cent
const MIDI_UNIT = 200 / MIDDLE;
const EXPRESSION = [60, 63, 66, 70, 80];

function noteToFrequency(n) {
	return Math.pow(2, (n - 69) / 12) * 440;
}

function frequencyToNote(f) {
	return 69 + (12 * Math.log2(f / 440));
}

function shiftChord(chord, shift) {
	let possible_notes = semitone;
	return chord.map(note => {
		let p = Util.getPitch(note);
		let o = Util.getOctave(note);
		let num = possible_notes.indexOf(p) + shift;
		if (num >= possible_notes.length) {
			o++;
			num %= possible_notes.length;
		}
		p = possible_notes[num];
		return p + o;
	});
}

function blendChord(chord, shift = 10) { // 'e3', 'g4', 'b4', 'e5'
	let pitch = Util.getPitch(chord); // 'e', 'g', 'b', 'e'
	let count = _.countBy(pitch);
	/*
	{
		'a' : 2,
		'e' : 1,
		'c#' : 1
	}
	*/
	let key = null;
	let blend = {};
	let notes_oct = null;
	let gather = null;

	for (const k in count) {
		if (count[k] == 2) {
			key = k; // a
			break;
		}
	}

	if (Util.isMinorChordByVoicingChord(Note[key], pitch)) { // 'e', 'g', 'b', 'e' 
		let oct = Util.getOctave(chord[0]); // 3
		notes_oct = Util.generateNoteWithOctave(Note[Util.changePitchWithoutOctave(semitone, key, -2)], oct, 1);
		// Util.changePitchWithoutOctave(semitone, key, -2) => 'd'
		// notes_oct => 'd3', 'e3', 'f#3', 'g3', 'a3', 'b3', 'c#4'
		// console.log(notes_oct);	

		if (chord[1] != notes_oct[3]) {
			oct++;
		}
		gather = perfectFifth(Note[key], key) + (oct - 3) // f# 4 a# 4 => c# 1,  f# 4 a#5 => c# 2
		// console.log(gather);	// c#1

	} else {
		let oct1 = Util.getOctave(chord[0]);
		let oct2 = Util.getOctave(chord[3]);
		let oct = oct1;
		notes_oct = Util.generateNoteWithOctave(Note[key], oct1, oct2 - oct1 + 1);

		if (pitch[0] == key) {
			let mediant = chord.filter(note => {
				return (Util.getPitch(note) == Note[key][2]);
			})[0];
			let mediant_oct = Util.getOctave(mediant);
			oct += mediant_oct - oct1;
		} else if (pitch[0] == Note[key][4]) {
			oct++;
		}

		gather = key + (oct - 2);
	}

	let note = jsmidgen.Util.midiPitchFromNote(gather); // 25
	blend = frequentToBlend(note, shift);
	/*
	{
		note: 5,
		msb: 45,
		lsb: 18
	}
	*/
	// if (Util.isMinorChordByVoicingChord(Note[key], pitch)) {
	// console.log(chord);
	// console.log(blend.note);
	// }

	blend.note = shiftChord(chord, blend.note);
	/*
	{
		note: ['e3', 'g#3', 'c4', 'e4'],
		msb: 45,
		lsb: 18
	}
	*/

	return blend;
}

function frequentToBlend(note, shift = 10) {
	// console.log('------------------------');
	// console.log(note);

	// c1 => 32
	// 42 => e1

	// c1 => e1 = 511
	// n => 5 semitone
	// cents => 11 cent



	let f = noteToFrequency(note) + shift;
	let d = frequencyToNote(f);
	let cents = (d - note) * 100;
	// console.log(cents);

	let n = 0;

	if (cents >= 100) {
		n = Math.floor(cents / 100);
		cents = cents % 100;
	} else if (cents <= -100) {
		n = Math.ceil(cents / 100);
		cents = cents % 100;
	}

	let blend = centsToBlend(cents)
	// 100 : 11
	// 127*127 : ?

	return {
		note: n,
		msb: blend.msb,
		lsb: blend.lsb
	}
}

function blendNote(note, shift = 10) {
	let blend = frequentToBlend(note, shift);
	blend.note = blend.note + note;
	return blend;
}

function centsToBlend(cents) {
	let blend = MIDDLE + Math.round(cents / MIDI_UNIT);
	let msb = Math.floor(blend / BYTE);
	let lsb = Math.round(blend - (msb * BYTE));
	return {
		msb: msb,
		lsb: lsb
	};
}

function perfectFifth(note_list, note) {
	let r = (note_list.indexOf(note) + 3) % note_list.length;
	return note_list[r];
}

function generateTrack(channel, notes, tempo, instrument, pan, shift) {
	let track = new jsmidgen.Track();
	track.setTempo(tempo)
	track.setInstrument(channel, instrument);
	if (pan != null)
		track.setPan(channel, pan);

	track.setExpression(channel, EXPRESSION[0]);
	let sum = 0;
	let bar = 1;
	for (let i = 0, size = notes.length; i < size; i++) {
		const noteObj = notes[i];

		if (i > size - (EXPRESSION.length + 1)) {
			track.setExpression(channel, EXPRESSION[size - 1 - i]);
		}

		if (i == size -1){
			noteObj.length *= 2;	
		}

		if (noteObj.note) {
			if (noteObj.note.length > 1) { // check Chord
				if (!shift) {
					noteObj.note.forEach(function (note, index) {
						track.noteOn(channel, note, 0, noteObj.level[index]);
					});
					noteObj.note.forEach(function (note, index) {
						if (index === 0) {
							track.noteOff(channel, note, noteObj.length);
						} else {
							track.noteOff(channel, note);
						}
					});
				} else {
					let blend = blendChord(noteObj.note, 10);

					track.setBlend(channel, blend.msb, blend.lsb);
					blend.note.forEach(function (note, index) {
						track.noteOn(channel, note, 0, ~~(noteObj.level[index] * 0.15));
					});
					blend.note.forEach(function (note, index) {
						if (index === 0) {
							track.noteOff(channel, note, noteObj.length, ~~(noteObj.level[index] * 0.15));
						} else {
							track.noteOff(channel, note, 0, ~~(noteObj.level[index] * 0.15));
						}
					});
				}
			} else {
				if (shift) {
					let note = jsmidgen.Util.midiPitchFromNote(noteObj.note[0]);
					let blend = blendNote(note, shift);

					track.setBlend(channel, blend.msb, blend.lsb);
					noteObj.note[0] = jsmidgen.Util.noteFromMidiPitch(blend.note);

					track.addNote(channel, noteObj.note, noteObj.length, 0, ~~((noteObj.level[0] * 3) / 4));
				} else {
					track.addNote(channel, noteObj.note, noteObj.length, 0, noteObj.level[0]);
				}
			}
		} else {
			track.noteOff(channel, '', noteObj.length);
		}

		sum += noteObj.length;
		if (sum == 512 && bar < EXPRESSION.length) {
			sum = 0;
			track.setExpression(channel, EXPRESSION[bar]);
			bar++;
		}
	}

	return track
}

/**
 * Take an array of note objects to generate a MIDI file in the same location as this method is called
 * @param  {Array} notes    Notes are in the format: {note: ['c3'], level: 127, length: 64}
 * @param  {String} fileName If a filename is not provided, then `music.mid` is used by default
 */
const midi = (music, fileName, binuaral = 0) => {
	let melodies = music.getMelody();

	fileName = fileName || 'music.mid';
	let file = new jsmidgen.File();

	if (binuaral == 0) {
		let melody = generateTrack(0, melodies, music.getTempo(), music.getInstrumentMelody());
		file.addTrack(melody);
		let chord = generateTrack(1, music.getChordProgression(), music.getTempo(), music.getInstrumentChord());
		file.addTrack(chord);
	} else {
		let track_left_melody = generateTrack(0, melodies, music.getTempo(), music.getInstrumentMelody(), PAN_LEFT);
		file.addTrack(track_left_melody);
		let track_left_chord = generateTrack(2, music.getChordProgression(), music.getTempo(), music.getInstrumentChord(), PAN_LEFT);
		file.addTrack(track_left_chord);

		let track_right_melody = generateTrack(1, melodies, music.getTempo(), music.getInstrumentMelody(), PAN_RIGHT, binuaral);
		file.addTrack(track_right_melody);
		let track_right_chord = generateTrack(3, music.getChordProgression(), music.getTempo(), music.getInstrumentChord(), PAN_RIGHT, binuaral);
		file.addTrack(track_right_chord);
	}

	fs.writeFileSync(fileName, file.toBytes(), 'binary');

	return file.toBytes();
}

module.exports = midi;