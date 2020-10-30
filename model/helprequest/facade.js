const mongoose = require('mongoose')
const Facade = require('../../lib/facade')
const helpRequestSchema = require('./schema')
const userFacade = require('../user/facade');
const cDates = require('compare-dates')

class HelpRequestFacade extends Facade {
  postHelpRequest(userId) {
    userFacade.getUserWithFeed(userId)
      .then(user => {
        const date = new Date();
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(date.getDate() - 14);
        const twoWeekFeed = user.feed.filter(post => cDates.isBefore(post.datetime, twoWeeksAgo)); // TODO: ARREGLAR que no filtra bien
        // Si ya existe un pedido de ese usuario, lo actualiza. No crea entradas duplicadas.
        this.Model.findOneAndUpdate({ 'user_id': userId }, {
          user_id: userId,
          request_date: date,
          profile: user.user_metadata.mental_profile,
          overallScore: user.user_metadata.overallScore,
          feed: twoWeekFeed,
        }, { upsert: true })
        .then( result => {
          console.log(result); // null
      }).catch( err => {
          console.log(err);
      });

      }).catch( err => {
        console.log(err);
      })

      return Promise.resolve({ thanks: 'thanks' });
  }
}

module.exports = new HelpRequestFacade('HelpRequest', helpRequestSchema)
