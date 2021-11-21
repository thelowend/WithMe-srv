const mongoose = require('mongoose')
const historySchema = require('../model/history/schema')
const NLU = require('../services/nlu') // Servicio de NLU
const Notification = require('../services/notification')
const Logger = require('../services/logger')

const HelpRequestFacade = require('../model/helprequest/facade')

const utils = require('./utils')
const error = require('./error');
// const logger = new Logger();

class Score {
  constructor() {
    this.today = new Date();
    this.fortnightAgo = new Date();
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

    // Al final no se utilizó. Lo que caracteriza el trastorno de estado de ánimo es la mismo impacto de intensidad de emociones a lo largo de un tiempo consistente.
    return Math.min(0.1143415 + (1.004078 - 0.1143415) / (1 + Math.pow((daysApart / 3.067045), 3.307601)), 1);
  }
  async processAllFeed(user, analysisCollection) {
    try {
      const historyCollection = [];
      for (let i = 0; i < user.feed.length; i++) {
        const post = user.feed[i];
        let score = NLU.getPostScore(analysisCollection[i]);

        const historyModel = mongoose.model('history', historySchema);
        const History = new historyModel({
          score: score,
          datetime: post.datetime,
        })
        historyCollection.push(History);

        // logger.info(post.text, analysisCollection[i]);
      }
      // Lo posteo en la history asincrónicamente
      user.updateOne(
        { $push: { 'history': { $each: historyCollection, $position: 0 } } }, { new: true },
      ).exec().then((res) => {
        console.log(res);
      }).catch(err => error.throw(err));
    } catch (err) {
      error.logError(0, err);
    }

  }
  async processFeed(user) {
    try {
      // Obtengo la fecha de procesamiento y el cut-off de dos semanas.
      this.today = new Date();
      this.fortnightAgo = utils.twoWeeksAgo(this.today);

      // Realiza el análisis de sentimientos de último post
      const analysisResults = await NLU.analyzeText(user.feed[0].text);

      // Extrae el puntaje del último post
      let score = NLU.getPostScore(analysisResults);

      // Evalúo el puntaje teniendo en cuenta las últimas dos semanas. Envío la última entrada 
      let overallResult = this._getUserEvaluation(score, user.history);

      // Si el puntaje supera el threshold para el usuario, envía una notificación a los voluntarios.
      if (overallResult > user.user_metadata.threshold) {
        const lastTwoWeeksFeed = user.feed.filter(post => utils.happenedAfter(post.datetime, this.fortnightAgo));
        const userId = user._id.toString();
        // Guardo el help request del usuario en el documento de la base de datos
        HelpRequestFacade.postHelpRequest(userId/*{
          user_id: userId,
          request_date: this.today,
          profile: user.user_metadata.mental_profile,
          overallScore: overallResult,
          feed: lastTwoWeeksFeed,
        }*/).then((res) => {
          user['feed'] = [];
          // Need to truncate feed to < 2048 bytes
          Notification.send(userId, lastTwoWeeksFeed); // Envío la notificación de la existencia del mismo a los voluntarios
          console.log('Help request posted');
        }).catch(err => error.throw(err));
      }

      // Genera la entrada del historial para el último post
      const historyModel = mongoose.model('history', historySchema);
      const History = new historyModel({
        score: score,
        datetime: user.feed[0].datetime
      });

      // Actualizo el historial y el último puntaje del usuario en la base.
      user.updateOne({
        $push: { 'history': { $each: [History], $position: 0 } },
        $set: {
          'user_metadata.overallScore': overallResult,
          'user_metadata.latestEvaluation': this.today,
        },
      }, { new: true }).exec()
        .then((res) => {
          console.log('update after processFeed');
        }).catch(err => {
          error.throw(err);
        });
    } catch (err) {
      error.logError(0, err);
      // Ver acá que hacer si falla watson
    }

  }
  _getUserEvaluation(latestScore, history) {
    let aggregateScore = latestScore;
    let pastTwoWeeks = [];
    for (let item of history) {
      if (utils.happenedBefore(item.datetime, this.fortnightAgo)) {
        break; //Esto es posible porque están ordenados en forma descendiente. Apenas se pasa las dos semanas, corta.
      }
      // let diffDias = cDates.diff(this.today, item.datetime, 'days', false);
      // aggregateScore += this._daysApartImpact(diffDias) * item.score;
      aggregateScore += item.score;
      pastTwoWeeks.push(item);
    }

    if (pastTwoWeeks.length >= 0) {
      aggregateScore = aggregateScore / (pastTwoWeeks.length + 1); // Sumo 1 porque se tiene en cuenta el latestScore, que aún no está en el historial.
    }

    return this._processScore(aggregateScore); // Normalizo el valor para que pueda ser evaluado vs el threshold del usuario.
  }
  _processScore(score) {
    /* 
     * El análisis de sentimientos asigna un puntaje al texto dentro del intervalo (-1, 1), donde los valores por debajo del 0 representan sentimientos negativos y los que están por encima del mismo positivos.
     * Para relacionar dicha calificación con el sistema de umbral de alerta, creamos una función de transformación de ajuste basada en el método exponencial.
     * La misma se creó utilizando la herramienta https://www.mycurvefit.com/ y con los siguientes pares ordenados, los cuales representan el nivel equivalente de negatividad total necesaria para disparar la alerta.
     *
     *  Score (X)          Threshold (Y)
     * ----------          -------------
     * -1                  1          
     * -0.95               0.9        
     * -0.8                0.6        
     * -0.5                0.2        
     *  1                  0  
     *                                         
     */
    // 
    
    return (-0.01438012 + 0.05945283 * Math.exp(-2.858466 * score));
  }
}

module.exports = new Score()