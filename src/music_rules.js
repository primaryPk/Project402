const Const = require('./music_constant');

function getRuleChord(name){
  return {
    any: [{
      all: [{
        fact: 'chordProgressive',
        path: name + '.pattern',
        operator: 'notEqual',
        value: null
      }, {
        fact: 'chordProgressive',
        path: name + '.chordChunk',
        operator: 'allContains',
        value: Const.chordsName
      }, {
        any: [{
          fact: 'chordProgressive',
          path: name + '.loop',
          operator: 'equal',
          value: undefined
        }, {
          fact: 'chordProgressive',
          path: name + '.loop',
          operator: 'equal',
          value: null
        }, {
          fact: 'chordProgressive',
          path: name + '.loop',
          operator: 'greaterThan',
          value: 0
        }]
      }]
    }, {
      fact: 'chordProgressive',
      path: name,
      operator: 'equal',
      value: null
    }]
  }
}

module.exports = {
  init: {
    all: [{
      fact: 'init',
      path: 'KeySignature',
      operator: 'allContains',
      value: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']
    }, {
      fact: 'init',
      path: 'Tempo',
      operator: 'between',
      value: {
        min: 0,
        max: 127
      }
    },
    // {
    //   fact: 'init',
    //   path: 'TimeSignature',
    //   operator: 'allContains',
    //   value: ['3/4', '4/4']
    // },
    {
      fact: 'init',
      path: 'InstrumentMelody',
      operator: 'between',
      value: {
        min: 0,
        max: 127
      }
    }, {
      fact: 'init',
      path: 'InstrumentChord',
      operator: 'between',
      value: {
        min: 0,
        max: 127
      }
    }]
  },
  songPart : {
    all: [{
      fact: 'initSuccess',
      operator: 'equal',
      value: true
    },
    {
      all: [{
        fact: 'songPart',
        path: 'pattern',
        operator: 'arr2D_allContains',
        value: Const.song_part
      }, {
        fact: 'songPart',
        path: 'TotalBarPerPart',
        operator: 'greaterThan',
        value: 0
      }]
    }]
  },
  chordProgressive: {
    all: [{
      fact: 'initSuccess',
      operator: 'equal',
      value: true
    },
    {
      all: [
        getRuleChord('main'),
        getRuleChord('Intro'),
        getRuleChord('Verse'),
        getRuleChord('PreChorus'),
        getRuleChord('Chorus'),
        getRuleChord('Bridge'),
        getRuleChord('Outro'),
      ]
    }]
  },
  molody: {
    all: [{
      fact: 'chordSuccess',
      operator: 'equal',
      value: true
    },
    {
      all: [{
        any: [{
          fact: 'melody',
          path: 'passingtone',
          operator: 'equal',
          value: true
        }, {
          fact: 'melody',
          path: 'passingtone',
          operator: 'equal',
          value: false
        }]
      }, {
        any: [{
          fact: 'melody',
          path: 'Outro.lastBar.pattern',
          operator: 'equal',
          value: undefined
        }, {
          fact: 'melody',
          path: 'Outro.lastBar.pattern',
          operator: 'isStringArrayOrString',
          value: true
        }]
      }]
    }]
  }
};