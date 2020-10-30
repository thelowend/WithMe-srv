const mongoose = require('mongoose')
const feedSchema = require('../model/feed/schema')
const historySchema = require('../model/history/schema')
const NLU = require('../services/nlu') // Servicio de NLU
const Notification = require('../services/notification')
const Logger = require('../services/logger')

const HelpRequestFacade = require('../model/helprequest/facade')

const cDates = require('compare-dates')
const logger = new Logger();

class Score {
  constructor() {
    this.today = new Date();
    this.fortnightAgo = new Date(this.today);
    this.fortnightAgo.setDate(this.today.getDate() - 14);
  }
  _beforePastTwoWeeks(date) { // Compute the time 14 days ago to use in filtering the data
    return cDates.isBefore(date, this.fortnightAgo);
  }
  _daysApartImpact(daysApart) {
    // https://www.mycurvefit.com/
    // Regresión logística de 4 parámetros (4PL -> 7 días: 0.2, 6 días: 0.2, 5 días: 0.4, 4 días: 0.6, 3 días: 0.8; 2 días: 1; 1 día: 1)
    // y = 0.1143415 + (1.004078 - 0.1143415)/(1 + (x/3.067045)^3.307601)

    /*
      What is four/five-parameter parallel lines logistic regression?
      Four parameter logistic model
      The four parameter logistic model writes:

      y = a + (d -a) / [1 + (x / c)b] model (1.1)

      where a, b, c, d are the parameters of the model, and where x corresponds to the explanatory variable and y to the response variable. 
      a and d are parameters that respectively represent the lower and upper asymptotes, and b is the slope parameter. 
      c is the abscissa of the mid-height point which ordinate is (a+b)/2. 
      When a is lower than d, the curve decreases from d to a, and when a is greater than d, the curve increases from a to d.
    */
    return Math.min(0.1143415 + (1.004078 - 0.1143415) / (1 + Math.pow((daysApart / 3.067045), 3.307601)), 1);
  }
  async processAllFeed(user, analysisCollection) {
    const historyCollection = [];
    for (let i = 0; i < user.feed.length; i++) {
      const post = user.feed[i];
      let score = this.getPostScore(analysisCollection[i]);
      // Lo posteo en la history asincrónicamente
      const historyModel = mongoose.model('history', historySchema);
      const History = new historyModel({
        score: score,
        datetime: post.datetime,
      })
      historyCollection.push(History);

      // logger.info(post.text, analysisCollection[i]);
    }
    user.updateOne(
      { $push: { 'history': { $each: historyCollection, $position: 0 } } }, { new: true },
    ).exec().then((res) => {
    }).catch((err) => {
      console.log(err);
    })
  }
  async processFeed(user) {
    // Realiza el análisis de sentimientos de último post
    const analysisResults = await NLU.analyzeText(user.feed[0].text);

    // Extrae el puntaje del último post
    let score = this._getPostScore(analysisResults);

    // Genera la entrada del historial para el último post
    const historyModel = mongoose.model('history', historySchema);
    const History = new historyModel({
      score: score,
      datetime: user.feed[0].datetime,
    });

    // Evalúo el puntaje teniendo en cuenta las últimas dos semanas
    let overallResult = this._getUserEvaluation(score, user.history);

    // Si el puntaje supera el threshold para el usuario, envía una notificación a los voluntarios.
    if (overallResult > user.user_metadata.threshold) {
      // Notification.send(overallResult, user);
      // Publico el usuario en asked for help
      debugger;
      HelpRequestFacade.postHelpRequest({
        user_id: user._id,
        request_date: new Date(),
        profile: user.user_metadata.mental_profile,
        overallScore: 0.5,
        feed: twoWeekFeed,
      }).then((res) => {
        console.log('help request posted');
      }).catch((err) => {
        console.log(err);
      });
    }

    // Actualizo el historial y el ultimo puntaje del usuario en la base.
    user.updateOne({
      $push: { 'history': { $each: [History], $position: 0 } },
      $set: { 'user_metadata.overallScore': overallResult },
    }, { new: true }).exec()
      .then((res) => {
        console.log('update after processFeed');
      }).catch((err) => {
        console.log(err);
      });
  }
  _getPostScore(analysis) {
    return analysis.sentiment.document.score;
  }
  _getUserEvaluation(latestScore, history) {
    let aggregateScore = latestScore;
    let pastTwoWeeks = [];
    for (let item of history) {
      if (this._beforePastTwoWeeks(item.datetime)) {
        break; //Esto es posible porque están ordenados en forma descendiente. Apenas se pasa las dos semanas, corta.
      }
      let diffDias = cDates.diff(this.today, item.datetime, 'days', false);
      aggregateScore += this._daysApartImpact(diffDias) * item.score;
      pastTwoWeeks.push(item);
    }
    return this._inverseSigmoid(aggregateScore); // Lo pongo entre 0 y 1;
  }
  _inverseSigmoid(x) {
    return (1 / (1 + Math.exp(x)));
  }
}

module.exports = new Score()