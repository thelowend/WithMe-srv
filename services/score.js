const mongoose = require('mongoose')
const feedSchema = require('../model/feed/schema')
const historySchema = require('../model/history/schema')
const NLU = require('../services/nlu') // Servicio de NLU

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
    return Math.min(0.1143415 + (1.004078 - 0.1143415)/(1 + Math.pow((daysApart/3.067045), 3.307601)), 1);
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

    // sólo guardar los negativos ?

    console.log(JSON.stringify(analysisResults, null, 2));

    let pastWeekHistory = [];
    let aggregateScore = 0;
    for (let item of user.feed) {
      if (this._beforePastWeek(item.datetime)) {
        break;
      }
      // tomar diferencia de días y aplicar dayOfTheWeekImpact
      let diffDias = cDates.diff(this.today, item.datetime, 'days', false);
      aggregateScore += this._daysApartImpact(diffDias) * 1;
      pastWeekHistory.push(item);
    }

    // Como la variedad de items acumulados en los últimos 7 días varía, tengo que hacer que la funcion sigmoide se "ensanche" usando dicho número, aunque cada vez menos.



    let score = this.getScore(analysisResults); // calcular el puntaje del último post
    
    /*
    for (let history of latestHistory) {
      score += history.score;
    }
    */

    let result = this._inverseSigmoid(analysisResults.sentiment.document.score);

    const historyModel = mongoose.model('history', historySchema);
    
    /*
    const historyResults = new Promise((resolve, reject) => {
      historyModel.findOneAndUpdate(
        { fb_id: status.uid },
        { $push: { 'feed': { $each: [ Feed ], $position: 0 } } },
        (err, result) => {
          if(err) {
            reject(err);
          }
          resolve(result);
        }
      )
    })
    */

    /*
    Promise.all([historyResults, analysisResults]).then((history, analysis) => {
      console.log(history); // ultimos 5 resultados
      console.log(JSON.stringify(analysis, null, 2));

      let result = this._inverseSigmoid(analysisResults.sentiment.document.score);
    })
    */
    
  }
  getScore(analysis) {

    return analysis.sentiment.document.score;

        // TODO: No hace falta await, que lo procese el server paralelamente.
    // Sentiment score va de -1 a 1
    /*
    {
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

  }
  _inverseSigmoid(x) {
    return (1 / (1 + Math.exp(x)));
  }
}

module.exports = new Score()