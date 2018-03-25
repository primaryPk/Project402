const _ = require('lodash');
const Const = require('./music_constant');

class Chord {

  constructor(notes) {
    this.notes = notes;
    this.permArr = [],
    this.usedChars = [];
  }

  findFirstOctaveFromNote(notes) {
    return (notes[0][0].toLowerCase() == 'a' || notes[0][0].toLowerCase() == 'b') ? 3 : 4;
  }

  generateChord() {
    let chords = {};
    let chord_length = [0, 2, 2, 3];
    let first_oct = this.findFirstOctaveFromNote(this.notes);
    let tmp_note = '';
    let octave = first_oct;
    let notes = _.flatten(Array(2).fill(this.notes));

    notes = notes.map(n => {
      if (tmp_note == '') {
        tmp_note = n;
        return n + first_oct;
      } else {
        if (Const.semitone.indexOf(tmp_note) > Const.semitone.indexOf(n)) {
          octave++;
        }
        tmp_note = n;
        return n + octave;
      }
    });

    for (let i in Const.chordsName) {
      if (Const.chordsName[i] == Const.chordsName[5] || Const.chordsName[i] == Const.chordsName[6]) {
        octave--;
      }
      chords[Const.chordsName[i]] = [];
      let pos = Number(i);
      for (let j in chord_length) {
        pos += Number(chord_length[j]);
        chords[Const.chordsName[i]].push(notes[pos]);
      }
    }
    let decrease_oct = n => n.substring(0, n.length - 1) + (n.substr(n.length - 1) - 1);
    chords[Const.chordsName[5]] = chords[Const.chordsName[5]].map(decrease_oct);
    chords[Const.chordsName[6]] = chords[Const.chordsName[6]].map(decrease_oct);

    // this.voicingChord(chords);
    // this.generateTriad(chords, 1);

    return chords;
  }

  getPitch(notes) {
    if (Array.isArray(notes)) {
      return notes.map(note => {
        return note.slice(0, note.length - 1);
      });
    } else {
      return notes.slice(0, notes.length - 1);
    }
  }

  voicingChord(chords) {
    let new_chord = {};
    for (const key in chords) {
      let chord = this.getPitch(chords[key]);
      new_chord[key] = [];
      let vocing = [];
      let bass = chord[0];
      let tails = _.tail(chord);

      this.permArr = [];
      this.usedChars = [];
      let permute = this.permute(tails);

      permute.map(chord => {
        return chord.unshift(bass);
      });

      let notes = this.notes;
      let bass_pos = notes.indexOf(bass);
      for (let j = 0; j < bass_pos; j++)
      notes.push(notes.shift())
      notes = _.flatten(Array(7).fill(notes));

      let octave = 3;
      let tmp_note = '';

      notes = notes.map(n => {
        if (tmp_note == '') {
          tmp_note = n;
          return n + octave;
        } else {
          if (Const.semitone.indexOf(tmp_note) > Const.semitone.indexOf(n)) {
            octave++;
          }
          tmp_note = n;
          return n + octave;
        }
      });
      // permute = [permute[0]]
      let octs = [3, 4];
      // octs = [3]

      octs.forEach(oct => {
        permute.forEach(p => {
          let o = oct;
          let tmp_p = p.slice(1);
          let gap_rules = [13, 7, 7];
          // let gap_rules = [14, 9, 9];
          let bass = p[0] + oct;

          let tree_chord = new Array(4).fill().map(u => ({}));
          tree_chord[0][bass] = [];
          // console.log(tree_chord);

          for (let i = 0; i < gap_rules.length; i++) {
            for (const start in tree_chord[i]) {
              let tmp_notes = notes.slice(notes.indexOf(start) + 1);
              // console.log('start => ' + start);

              let j = 0;
              for (; j < gap_rules[i]; j++) {
                let pitch = this.getPitch(tmp_notes[j]);
                // process.stdout.write(tmp_notes[j] + " "); // print
                if (pitch == tmp_p[i]) {
                  // console.log();
                  // console.log(tmp_notes[j] + " ***");
                  tree_chord[i][start].push(tmp_notes[j]);
                  tree_chord[i + 1][tmp_notes[j]] = [];

                  // console.log(tree_chord[i]);
                }

              }

            }
            // console.log('---------');
          }

          let new_chord2 = _.chunk(Object.keys(tree_chord[3]));

          for (let i = 2; i >= 0; i--) {

            for (let j = 0; j < new_chord2.length; j++) {
              let last_note = _.last(new_chord2[j]);
              // console.log(new_chord2[j]);
              // console.log(last_note);
              for (const note in tree_chord[i]) {
                // console.log(note);
                // console.log(tree_chord[i][note]);

                if (tree_chord[i][note].indexOf(last_note) >= 0) {
                  new_chord2[j].push(note);
                  break;
                }
              }
              // console.log('========');               
            }
            // console.log('+++++++++++++++');
          }


          // console.log('//////////');
          // console.log(new_chord2);
          // console.log(tree_chord);
          // console.log(tmp_p);

          new_chord[key].push(new_chord2);
        });
      });
    }
    
    // console.log(permute);
    // console.log(notes);

    // console.log(_.flatten(chord));
    return _.mapValues(new_chord, function (arr) {
      // console.log(_.uniqWith(_.flatten(arr), _.isEqual));
            
      return _.uniqWith(_.flatten(arr), _.isEqual);
    });
    
  }

  generateVoicingAndTriad(chords){
    let voicing = this.voicingChord(chords);
    for (let i = 0; i < 2; i++) {
      chords = this.generateTriad(chords, 1);
      let tmp = this.voicingChord(chords);
      voicing = _.mapValues(voicing, function (arr, key) {
        return _.concat(arr, tmp[key]);
      });
    }
    // console.log(voicing);
    
    return voicing;
  }

  generateTriad(chords, n) {
    let triad = {};
    for (const k in chords) {
      triad[k] = [];
      let last = _.last(chords[k]);
      let chord = _.initial(chords[k]);
      for (let j = 0; j < n; j++)
        chord.push(chord.shift())
      chord.forEach(note => {
        triad[k].push(note);
      });
      triad[k].push(last);
    }
    console.log(triad);
    return triad;
  }

  permute(input) {
    var i, ch;
    for (i = 0; i < input.length; i++) {
      ch = input.splice(i, 1)[0];
      this.usedChars.push(ch);
      if (input.length == 0) {
        this.permArr.push(this.usedChars.slice());
      }
      this.permute(input);
      input.splice(i, 0, ch);
      this.usedChars.pop();
    }
    return this.permArr
  };

  classifiedChord(chords){
    // for (const key in chords) {
      let key = 'I';//////////////////////
      // console.log(chords[key]);
    let all_posible_note = [];
    let tmp_note = '';
    let tmp_oct = 2;
    for (let i = 0; i < 5; i++) {
      this.notes.forEach(n => {
        if (tmp_note == '') {
          tmp_note = n;
          all_posible_note.push(n + tmp_oct);
        } else {
          if (Const.semitone.indexOf(tmp_note) > Const.semitone.indexOf(n)) {
            tmp_oct++;
          }
          tmp_note = n;
          all_posible_note.push(n + (tmp_oct));
        }
      });
    }
    // console.log(all_posible_note);
    

    let lvl0 = [];
    let lvl1 = [];
    let lvl2 = [];

    chords[key].forEach(chord => {
      let chord1 = chord.map(note => all_posible_note.indexOf(note));
      let min = Math.min(...chord1);
      let max = Math.max(...chord1);
      
      if (max - min < 10){
        lvl0.push(chord)
      } else if (max - min < 15){
        lvl1.push(chord)
      } else {
        lvl2.push(chord)
      }
      
    })    

    // console.log(lvl0);
    // console.log('---------------');
    // console.log(lvl1);
    // console.log('---------------');
    // console.log(lvl2);
    // console.log('---------------');
    
    // }
    return chords.I
  }


}

module.exports = Chord;