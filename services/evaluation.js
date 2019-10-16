const mongoose = require('mongoose')

class Evaluation {
  constructor() { 
    this.conversionTables = {
      adult: [37.1, 43.3, 46.2, 48.2, 49.8, 51.2, 52.3, 53.4, 54.3, 55.3, 56.2, 57.1, 57.9, 58.8, 59.7, 60.7, 61.6, 62.5, 63.5, 64.4, 65.4, 66.4, 67.4, 68.3, 69.3, 70.4, 71.4, 72.5, 73.6, 74.8, 76.2, 77.9, 81.1],
      child: [37.1, 43.3, 46.2, 48.2, 49.8, 51.2, 52.3, 53.4, 54.3, 55.3, 56.2, 57.1, 57.9, 58.8, 59.7, 60.7, 61.6, 62.5, 63.5, 64.4, 65.4, 66.4, 67.4, 68.3, 69.3, 70.4, 71.4, 72.5, 73.6, 74.8, 76.2, 77.9, 81.1]
    }
  }
  evaluate(analysis, type) {
    let result, rawScore = 0;
    switch (type) {
      case 'adult':
        for (let i = 0; i < Object.keys(analysis).length; i++) {
          rawScore += analysis[i];
        }
        result = this.getThreshold(this.conversionTables[type][rawScore]);
        break;
      case 'child':
        for (let i = 0; i < Object.keys(analysis).length; i++) {
          rawScore += analysis[i];
        }
        result = this.getThreshold(this.conversionTables[type][rawScore]);
        break;
      default:
        break;
    }
    return result;
  }
  getThreshold(score) {
    let threshold = 1;
    if (score < 55.0) {
      threshold = 0.9; // None to slight
    } else if(score < 60) {
      threshold = 0.6; // Mild
    } else if(score < 70) {
      threshold = 0.4; // Moderate
    } else {
      threshold = 0.2; // Severe
    }
    return threshold;
  }
}

module.exports = new Evaluation()