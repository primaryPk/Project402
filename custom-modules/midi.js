const fs = require('fs');
const assert = require('assert');
const jsmidgen = require('./jsmidgen');
const transpose = require('scribbletune/src/transpose');

const PAN_LEFT = 0;
const PAN_RIGHT = 127;
const BYTE = 128;
const RANGE = BYTE * BYTE;
const MIDDLE = RANGE / 2;
// 2^7 midi = 200 cent
const MIDI_UNIT = 200 / MIDDLE;

function noteToFrequency(n){
	return Math.pow(2, (n-69)/12) * 440;
}

function frequencyToNote(f) {
	return 69 + (12 * Math.log2(f/440)); 
}

function blendChord(note1, note3, shift = 10) {
	let n1 = noteToFrequency(note1);
	let n3 = noteToFrequency(note3);

	let f = (n3-n1)/2;
	f = f + shift;

	let d = frequencyToNote(f);
	let note = Math.floor(d);
	let cents = (d - note) * 100;

	if (cents >= 100) {
		let n = Math.floor(cents / 100);
		cents = cents % 100;
		note += n; // New note

	} else if (cents <= -100) {
		let n = Math.ceil(cents / 100);
		cents = cents % 100;
		note += n; // New note
	}

	let blend = MIDDLE + Math.round(cents / MIDI_UNIT);

	let msb = Math.floor(blend / BYTE);
	let lsb = Math.round(blend - (msb * BYTE));

	return {
		note: note,
		msb: msb,
		lsb: lsb
	}
}

function frequentToBlend(note, shift = 10){
	let f = noteToFrequency(note) + shift;
	let d = frequencyToNote(f);
	let cents = (d - note) * 100;
	
	if(cents >= 100){
		let n = Math.floor(cents/100);
		cents = cents % 100;
		note += n; // New note

	} else if(cents <= -100) {
		let n = Math.ceil(cents/100);
		cents = cents % 100;		
		note += n; // New note
	}
	
	let blend = MIDDLE + Math.round(cents / MIDI_UNIT);
	
	let msb = Math.floor(blend / BYTE);
	let lsb = Math.round(blend - (msb * BYTE));

	return { note: note, msb: msb, lsb: lsb }
	
}

function isMajorChord(note){
	return (note[0] == 'c' || note[0] == 'f' || note[0] == 'g');
}

function perfectFifth(note) {
	let note_list = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
	let r = (note_list.indexOf(note[0]) + 3) % note_list.length;
	if (note.length > 2){
		return note_list[r] + note[1] + (parseInt(note[2]) - 2);
	} else {
		return note_list[r] + (parseInt(note[1]) - 3);
	}
}

function generateTrack(channel, notes, tempo, instrument, pan, shift){
	let track = new jsmidgen.Track();
	track.setTempo(tempo)
	track.setInstrument(channel, instrument);
	if (pan != null)
		track.setPan(channel, pan);

	notes.forEach((noteObj) => {
		let level = noteObj.level || 127;
		
		if (noteObj.note) {
			if (noteObj.note.length > 1){
				if (!shift) {
					track.addChord(channel, noteObj.note, noteObj.length, 75);
				} else {					
					let n1 = jsmidgen.Util.midiPitchFromNote(noteObj.note[0]);
					let n3 = jsmidgen.Util.midiPitchFromNote(noteObj.note[2]);
					
					let n = '';
					if (isMajorChord(noteObj.note[0])){
						n = noteObj.note[0][0] + (parseInt(noteObj.note[0][1])-2);
					} else {
						n = perfectFifth(noteObj.note[0]);
					}					
					
					let blend = frequentToBlend(n, shift);
					track.setBlend(channel, blend.msb, blend.lsb);
					track.addNote(channel, blend.note, noteObj.length, 0, 20);					
				}
			} else {			
				if (shift){		
					let note = jsmidgen.Util.midiPitchFromNote(noteObj.note[0]);
					let blend = frequentToBlend(note, shift);	
		
					track.setBlend(channel, blend.msb, blend.lsb);
					noteObj.note[0] = jsmidgen.Util.noteFromMidiPitch(blend.note);
		
					track.addNote(channel, noteObj.note, noteObj.length, 0, 75);
				} else {
					track.addNote(channel, noteObj.note, noteObj.length, 0, 87);
				}
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
		let chord = generateTrack(1, chords, music.getTempo(), music.getInstrumentChord());
		file.addTrack(chord);
	} else {		
		let track_left_melody = generateTrack(0, melodies, music.getTempo(), music.getInstrumentMelody(), PAN_LEFT);
		file.addTrack(track_left_melody); 
		let track_left_chord = generateTrack(2, chords, music.getTempo(), music.getInstrumentChord(), PAN_LEFT);
		file.addTrack(track_left_chord);
		
		let track_right_melody = generateTrack(1, melodies, music.getTempo(), music.getInstrumentMelody(), PAN_RIGHT, binuaral);
		file.addTrack(track_right_melody);
		let track_right_chord = generateTrack(3, chords, music.getTempo(), music.getInstrumentChord(), PAN_RIGHT, binuaral);
		file.addTrack(track_right_chord);
	}

	
	fs.writeFileSync(fileName, file.toBytes(), 'binary');
}

module.exports = midi;