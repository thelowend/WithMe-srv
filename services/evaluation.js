const mongoose = require('mongoose')

const PROFILE = {
  SLIGHT: { description: "Slight", threshold: 0.9, scoreLimit: 55 },  // None to slight
  MILD: { description: "Mild", threshold: 0.6, scoreLimit: 60 },  // Mild
  MODERATE: { description: "Moderate", threshold: 0.4, scoreLimit: 70 }, // Moderate
  SEVERE: { description: "Severe", threshold: 0.2, scoreLimit: 100 },  // Severe
}
class Evaluation {
  constructor() { 
    // The conversion tables for T-Scores from the DSMV manual
    this.conversionTables = {
      adult: [37.1, 43.3, 46.2, 48.2, 49.8, 51.2, 52.3, 53.4, 54.3, 55.3, 56.2, 57.1, 57.9, 58.8, 59.7, 60.7, 61.6, 62.5, 63.5, 64.4, 65.4, 66.4, 67.4, 68.3, 69.3, 70.4, 71.4, 72.5, 73.6, 74.8, 76.2, 77.9, 81.1],
      child: [31.7, 35.2, 36.9,39.1, 40.6, 42.4, 43.8, 45.2, 46.5, 47.6, 48.7, 49.7, 50.6, 51.5, 52.4, 53.2, 54, 54.8, 55.6, 56.3, 57, 57.7, 58.4, 59.1, 59.8, 60.4, 61.1, 61.8, 62.4, 63.1, 63.8, 64.4, 65.1, 65.7, 66.4, 67, 67.7, 68.4, 69, 69.7, 70.4, 71.1, 71.8, 72.6, 73.3, 74.1, 74.9, 75.7, 76.6, 77.5, 78.4, 79.4, 80.6, 81.7, 83.1, 84.6, 86.6 ], 
    }
  }
  evaluate(analysis, type) {
    let rawScore = 0;
    for (let i = 0; i < Object.keys(analysis).length; i++) {
      rawScore += analysis[i];
    }
    return this.getMentalProfile(this.conversionTables[type][rawScore]);
  }
  getMentalProfile(score) {
    let mentalProfile = PROFILE.SEVERE;
    if (score < PROFILE.SLIGHT.scoreLimit) {
      mentalProfile = PROFILE.SLIGHT;
    } else if(score < PROFILE.MILD.scoreLimit) {
      mentalProfile = PROFILE.MILD;
    } else if(score < PROFILE.MODERATE.scoreLimit) {
      mentalProfile = PROFILE.MODERATE;
    }
    return mentalProfile;
  }
}

module.exports = new Evaluation()