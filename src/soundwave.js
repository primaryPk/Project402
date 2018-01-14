module.exports = {
  violin: function (f, i, samples_length, volume){
    var t = i / samples_length;
    var y = 0;
    var A_total = 0;
    for (var harm = 1; harm <= 7; harm++) {
      var f2 = f * harm;
      var A = 1 / harm;
      A_total += A;
      y += A * Math.sin(f2 * 2 * Math.PI * t);
    }
    var d = y / A_total;
    d *= (1 - 0.5 * Math.sin(2 * Math.PI * 6 * t));
    d *= (1 - Math.exp(-t * 3));
    d *= volume;
    return d;
  },

  clarinet: function (f, i, samples_length, volume) {
    var t = i / samples_length;
    var w = f * 2 * Math.PI * t;
    var d = (Math.sin(w) + 0.75 * Math.sin(w * 3) + 0.5 * Math.sin(w * 5) + 0.14 * Math.sin(w * 7) + 0.5 * Math.sin(w * 9) + 0.12 * Math.sin(11 * w) + 0.17 * Math.sin(w * 13)) / (1 + .75 + .5 + .14 + .17);
    d *= Math.exp(t / 1.5);
    d *= Math.exp(-t * 1.5);
    d *= volume;
    return d;
  },

  sine: function (f, i, samples_length, volume){
    // Math.sin(f * i) * ((i < fade) ? i : (i > nonZero) ? blocksOut - i + 1 : fade) / fade
    // Math.sin(f * Math.PI * 2 * i / samples_length)
    var t = i / samples_length;
    var w = f * 2 * Math.PI * t;
    var d =  volume * Math.sin(w);
    return d  
  },

  advance: function (frequency, i, sampleRate, volume) {
    var attack = 0.002;
    if (i <= sampleRate * attack) {
      // Linear build-up, fast.
      curVol = volume * (i / (sampleRate * attack));
      return curVol;
    } else {
      // Decay. Exponentially increasing (faster) decay
      // at higher frequencies due to logarithmic dampener.
      var dampen = Math.pow(0.5 * Math.log((frequency * volume) / sampleRate), 2);
      curVol = volume * Math.pow(
        (1 - ((i - (sampleRate * attack)) / (sampleRate * (0.1 - attack)))), dampen
      );
      return 0.5
    }
  },
}