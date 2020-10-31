const Facade = require('../../lib/facade');
const helpRequestSchema = require('./schema');
const userFacade = require('../user/facade');
const utils = require('../../services/utils');
const error = require('../../services/error');

class HelpRequestFacade extends Facade {
  postHelpRequest(userId) {
    try {
      userFacade.getUserWithFeed(userId)
        .then(user => {
          const date = new Date();
          const lastTwoWeeksFeed = user.feed.filter(post => utils.happenedAfter(post.datetime, utils.twoWeeksAgo(date)));

          // Si ya existe un pedido de ese usuario, lo actualiza. No crea entradas duplicadas.
          this.Model.findOneAndUpdate({ 'user_id': userId }, {
            user_id: userId,
            request_date: date,
            profile: user.user_metadata.mental_profile,
            overallScore: user.user_metadata.overallScore,
            feed: lastTwoWeeksFeed,
          }, { upsert: true })
            .then(result => {
              console.log('Help Request Posted Properly'); // null
            }).catch(err => error.throw(err));

        }).catch(err => error.throw(err));
    } catch (err) {
      return Promise.reject(err);
    }
    return Promise.resolve({ thanks: 'thanks' });
  }
}

module.exports = new HelpRequestFacade('HelpRequest', helpRequestSchema)