const mongoose = require('mongoose')
const feedSchema = require('../model/feed/schema')
const historySchema = require('../model/history/schema')
const NLU = require('../services/nlu') // Servicio de NLU
const Notification = require('../services/notification')

const cDates = require('compare-dates')

class Score {
  constructor() {
    this.today = new Date();
    this.sevenDaysAgo = new Date();
    this.sevenDaysAgo.setDate(this.today.getDate() - 30);
  }
  _beforePastWeek(date) { // Compute the time 7 days ago to use in filtering the data
    return cDates.isBefore(date, this.sevenDaysAgo);
  }
  _daysApartImpact(daysApart) {
    // Regresión logística de 4 parámetros (4PL -> 7 días: 0.2, 6 días: 0.2, 5 días: 0.4, 4 días: 0.6, 3 días: 0.8; 2 días: 1; 1 día: 1)
    // y = 0.1143415 + (1.004078 - 0.1143415)/(1 + (x/3.067045)^3.307601)
    return Math.min(0.1143415 + (1.004078 - 0.1143415) / (1 + Math.pow((daysApart / 3.067045), 3.307601)), 1);
  }
  async processFeed(user) {

    const analysisResults = await NLU.analyzeText(user.feed[0].text); // Realiza el análisis de sentimientos de último post

    // Para ahorrar la call:
    /*
    const analysisResults = {
      "usage": {
        "text_units": 1,
        "text_characters": 92,
        "features": 4
      },
      "sentiment": {
        "document": {
          "score": -0.953238,
          "label": "negative"
        }
      },
      "language": "en",
      "emotion": {
        "document": {
          "emotion": {
            "sadness": 0.685109,
            "joy": 0.143623,
            "fear": 0.086354,
            "disgust": 0.041431,
            "anger": 0.081949
          }
        }
      }
    }
    */

    console.log(JSON.stringify(analysisResults, null, 2));

    // Calcular el puntaje del último post
    let score = this.getScore(analysisResults); 

    // Lo posteo en la history asincrónicamente
    const historyModel = mongoose.model('history', historySchema);
    const History = new historyModel({
      score: score,
      datetime: user.feed[0].datetime,
    })

    user.updateOne(
      { $push: { 'history': { $each: [ History ], $position: 0 } } }, { new: true }, 
    ).exec().then((res) => {

    }).catch((err) => {
      console.log(err);
    })

    // Obtengo los scores anteriores cumulativos
    let pastWeekHistory = [];
    let aggregateScore = score; // Empiezo con el valor que acabo de calcular
    for (let item of user.history) {
      if (this._beforePastWeek(item.datetime)) {
        break; //Esto es posible porque están ordenados en forma descendiente. Apenas se pasa de la semana, corta.
      }
      // tomar diferencia de días y aplicar dayOfTheWeekImpact
      let diffDias = cDates.diff(this.today, item.datetime, 'days', false);
      aggregateScore += this._daysApartImpact(diffDias) * item.score;
      pastWeekHistory.push(item);
    }

    let overallResult = this._inverseSigmoid(aggregateScore); // Resultado de aplicar el sigmoide a todo el cumulativo

    if (overallResult > user.user_metadata.threshold) {
      Notification.send(overallResult, user);
    }

  }
  getScore(analysis) {
    return analysis.sentiment.document.score;
  }
  _inverseSigmoid(x) {
    return (1 / (1 + Math.exp(x)));
  }
}

module.exports = new Score()