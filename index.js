const MusicGenerator = require('./src/music_generator');
const midi = require('./custom-modules/midi');
const Const = require('./config/music_constant');
const Instrument = require('./config/instrument_range');
const Motif = require('./src/motif');
const Util = require('./src/util');
const fs = require('fs');
const express = require('express');
const app = express();
app.enable('trust proxy');

fs.stat('./pool', function (err, stats) {
  if (err) {
    fs.mkdirSync('./pool');
  }
});

const music = new MusicGenerator();

const chord = [
  ['I', 'vi', 'IV', 'V'],
  ['ii', 'V', 'I', 'IV'],
  ['vi', 'V', 'IV', 'V'],
  ['I', 'ii', 'vi', 'IV'],
  ['I', 'iii', 'vi', 'IV'],
  ['I', 'iii', 'ii', 'IV'],
  ['I', 'ii', 'iii', 'IV'],
  ['I', 'ii', 'vi', 'IV'],
  ['I', 'IV', 'I', 'IV'],
  ['I', 'I', 'IV', 'IV'],
  ['IV', 'I', 'IV', 'I'],
  ['IV', 'I', 'IV', 'V'],
  ['I', 'vi', 'ii', 'IV']
]
const list_key = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F'];
const inst_melody = [1, 3, 93, 41, 74, 25, 26];
const inst_chord = [1, 3, 93, 25, 26, 42, 43];
const inst_melody_paino = [1, 3];
const inst_melody_ww = [74];
const inst_melody_string = [41, 25, 26];
const inst_chord_paino = [1, 3];
const inst_chord_string = [42, 43, 25, 26];
const tempo_all = {
  min: 60,
  max: 120
};
const tempo_slow = {
  min: 60,
  max: 80
};
const tempo_medium = {
  min: 81,
  max: 100
};
const tempo_fast = {
  min: 101,
  max: 120
};
const my_motif = [{
    notes: [0, 0, 1, 1],
    pattern: 'x_x_x_x_'
  },
  {
    notes: [0, 1, 0, -1],
    pattern: 'x_x_x_x_'
  },
  {
    notes: [0, 1, 1, 1],
    pattern: 'x_x_x_x_'
  },
  {
    notes: [0, 1, -1, 0],
    pattern: 'x_x_x_x_'
  },
  {
    notes: [0, 1, 1],
    pattern: 'x_x_x_'
  },
  {
    notes: [0, 1, -1],
    pattern: 'x_x_x_'
  },
  {
    notes: [0, 1, 0],
    pattern: 'x_x_x_'
  },
  {
    notes: [0, 0, 1],
    pattern: 'x_x_x_'
  },
  {
    notes: [0, 2, -1],
    pattern: 'x_x_x_'
  },
  {
    notes: [0, 0],
    pattern: 'x_x_'
  },
  {
    notes: [0, 1],
    pattern: 'x_x_'
  },
  {
    notes: [0, 2],
    pattern: 'x_x_'
  },
];

app.get('**', (req, res, next) => {
  console.log(req.originalUrl);

  res.fact = {
    songPart: {
      pattern: [
        ['Intro', 'Verse', 'Chorus', 'Outro'],
        ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Outro']
      ],
    },
    chordProgressive: {
      Intro: {
        chord: [
          ['I', 'IV'],
          ['IV', 'I'],
          ['I', 'V'],
          ['V', 'I'],
          ['ii', 'V', 'I', 'IV'],
          ['I', 'vi', 'ii', 'IV']
        ],
        cadence: ['V'],
        phase: 4,
        rhythm: 1
      },
      Verse: {
        chord: chord,
        cadence: ['', 'V'],
        phase: 2,
        rhythm: 2
      },
      Chorus: {
        chord: chord,
        cadence: [''],
        phase: 2,
        rhythm: 4
      },
      Outro: {
        chord: chord.map(e => {
          let x = e.slice(0);
          x.push('I');
          return x;
        }),
        cadence: [''],
        phase: 1,
        rhythm: 1
      },
    }
  };

  res.fact.init = {
    KeySignature: list_key,
    Tempo: tempo_slow,
    InstrumentMelody: inst_melody,
    InstrumentChord: inst_chord,
  }

  res.fact.melody = {
    motif: my_motif
  };
  music.setFacts(res.fact);
  res.freq = 0;
  next();
});

app.get('/test/:newsong/:bi', (req, res) => {
  var ip = 'test_' + req.ip.replace(/[^a-zA-Z0-9]/g, '_');
  var dir = 'pool/' + ip;

  res.fact.melody = {
    motif: [{
      notes: [0, 1, -1],
      pattern: 'x_x_x_'
    }, {
      notes: [0, 1, 1],
      pattern: 'x_x_x_'
    }]
  };
  music.setFacts(res.fact);

  if (req.params.newsong == 0) {
    var bi = req.params.bi == 0 ? '' : 'bi';
    res.sendFile(__dirname + '/' + dir + '/test' + bi + '.mid');
  } else {
    music.runEngine().then(() => {
      music.init();

      music.composeChordProgreesion();
      music.composeMelody();

      let file = 'song_test => ' +
        music.getKeySig() + ' ' + music.getMotif() + ' ' +
        music.getTempo() + ' ' +
        Instrument[music.getInstrumentMelody()].name + ' ' +
        Instrument[music.getInstrumentChord()].name + ' ' +
        music.getSimpleChordProgression();
      console.log(file);


      fs.stat(__dirname + '/pool/' + ip, function (err, stats) {
        if (err) {
          fs.mkdirSync('./pool/' + ip);
        }

        midi(music, dir + '/test.mid', 0);
        midi(music, dir + '/testbi.mid', 10);

        var bi = req.params.bi == 0 ? '' : 'bi';
        res.sendFile(__dirname + '/' + dir + '/test' + bi + '.mid');
      });
    });
  }
});

app.get('/:inst/:freq', (req, res, next) => {
  var inst_m;
  var inst_c;
  if (req.params.inst == 1) {
    inst_m = inst_melody_paino;
    inst_c = inst_chord_paino;
  } else if (req.params.inst == 2) {
    inst_m = inst_melody_string;
    inst_c = inst_chord_string;
  } else if (req.params.inst == 3) {
    inst_m = inst_melody_ww;
    inst_c = inst_chord;
  } else {
    inst_m = inst_melody;
    inst_c = inst_chord;
  }

  res.fact.init.InstrumentMelody = inst_m;
  res.fact.init.InstrumentChord = inst_c;

  music.setFacts(res.fact);
  res.freq = Number(req.params.freq);
  next();
});

app.get('**', (req, res) => {
  music.runEngine().then(() => {
    music.init();

    music.composeChordProgreesion();
    music.composeMelody();

    let file = 'song => ' +
      music.getKeySig() + ' ' + music.getMotif() + ' ' +
      music.getTempo() + ' ' +
      Instrument[music.getInstrumentMelody()].name + ' ' +
      Instrument[music.getInstrumentChord()].name + ' ' +
      music.getSimpleChordProgression();
    console.log(file);

    var ip = req.ip.replace(/[^a-zA-Z0-9]/g, '_');

    fs.stat(__dirname + '/pool/' + ip, function (err, stats) {
      if (err) {
        fs.mkdirSync('./pool/' + ip);
      }

      midi(music, 'pool/' + ip + '/test.mid', res.freq);
      res.sendFile(__dirname + '/pool/' + ip + '/test.mid');
    });

  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('App listening on port ' + (process.env.PORT || 3000) + '!')
})
