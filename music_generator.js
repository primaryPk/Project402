class MusicGenerator{

    constructor(){
        this.melody = [];
        this.chordProgression = [];

        init();
        initInstruments();
    }

    init(){
        this.tempo = Math.floor(Math.random() * 21) + 60
        this.keySig = ['c', 'g', 'd', 'a', 'e', 'b', 'f#', 'f'];
        this.key = random(this.keySig);      
    }
    
    initInstruments(){
        this.instNameChord = ['piano', 'elec piano', 'syn', 'classic guitar', 'folk guitar'];
        this.instNameMelody = ['piano', 'elec piano', 'syn', 'violin', 'viola', 'cello', 'flute', 'obeo', 'clarinets'];
        this.instNumChord = [1, 3, 93, 25, 26];
        this.instNumMelody = [1, 3, 93, 41, 42, 43, 74, 69, 72];
        this.instMelody = random(this.instNumMelody);
        this.instChord = random(this.instNumChord);
    }

    getMelody(){
        return ["a4", 'c4']
    }

    getChordProgression(){
        return [1,4,5,1,4,5,1,4,5]
    }

    getTempo(){
        return this.tempo;
    }

    random(arr) {
        return Math.floor(Math.random() * arr.length);
    }
}

module.exports = MusicGenerator;