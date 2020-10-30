const mongoose = require('mongoose')
const Facade = require('../lib/facade')
const feedSchema = require('../model/feed/schema')
const userSchema = require('../model/user/schema')

const Score = require('../services/score') // Servicio de scoring (nuestro algoritmo)

const posts = require('../evaluation/samples/posts');
const results = require('../evaluation/samples/results');

class HookFacade extends Facade {
  PutMultiple(id, num, sad) {
    const userModel = mongoose.model('user', userSchema);
    const feedModel = mongoose.model('feed', feedSchema);

    const date = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(date.getDate() - 14);

    const sources = ['fb','tw','ig','tm'];
    const feedCollection = [];
    const analysisCollection = [];
    

    // Generate posts from social media
    let days = 0;
    for (let i = 0; i < num; i++) {
      date.setDate(twoWeeksAgo.getDate() + days);
      const value = Math.floor(Math.random() * 100) + 1;
      const baseEmotion = value <= sad ? 'sad' : 'happy';
      const index = Math.floor(Math.random() * posts[baseEmotion].length);
      const Feed = new feedModel({
        source: sources[Math.floor(Math.random() * sources.length)],
        datetime: date,
        text: posts[baseEmotion][index],
        hour: date.getHours(),
        day: date.getDay(),
        month: date.getMonth(),
        year: date.getFullYear(),
      });
      feedCollection.push(Feed);
      analysisCollection.push(results[baseEmotion][index]);
      if (days === 13) {
        days = 0;
      } else {
        days++;
      }
    }

    return userModel.findOneAndUpdate(
      { _id: id },
      { feed : feedCollection }, { new: true }, 
    ).select(['user_metadata', 'feed', 'history']).exec()
    .then(user => new Promise(function(resolve, reject) {
      //manejar el catch también
      //Score.getTotalScore(analysisCollection); // Proceso asincrónico del servidor
      Score.processAllFeed(user, analysisCollection);
      resolve(user);
    })).catch(err => {
      console.log(err);
    });
  }
  PutFromFB(body) {
    const status = body.entry[0]; // El estado de FB del usuario
    let sDate = new Date(status.time * 1000); // Se multiplica por 1000 porque de fecha de FB viene dividido por 1000
    let sText = status.changes[0].value.trim();

    const userModel = mongoose.model('user', userSchema);
    const feedModel = mongoose.model('feed', feedSchema);

    const Feed = new feedModel({
      source: 'fb',
      datetime: sDate,
      text: sText,
      hour: sDate.getHours(),
      day: sDate.getDay(),
      month: sDate.getMonth(),
      year: sDate.getFullYear(),
    })

    return userModel.findOneAndUpdate(
      { fb_id: status.uid },
      { $push: { 'feed': { $each: [ Feed ], $position: 0 } } }, { new: true }, 
    ).select(['user_metadata', 'feed', 'history']).exec()
    .then(user => new Promise(function(resolve, reject) {
      //manejar el catch también
      Score.processFeed(user); // Proceso asincrónico del servidor
      resolve(user);
    })).catch(err => {
      console.log(err);
    });
    

  }
  PutFromTW(body) {
    const status = body.entry[0]; // El estado de FB del usuario
    const sDate = new Date(status.time * 1000); // Se multiplica por 1000 porque de fecha de FB viene dividido por 1000
    const sText = status.changes[0].value.trim();

    const userModel = mongoose.model('user', userSchema);
    const feedModel = mongoose.model('feed', feedSchema);

    const Feed = new feedModel({
      source: 'tw',
      datetime: sDate,
      text: sText,
      hour: sDate.getHours(),
      day: sDate.getDay(),
      month: sDate.getMonth(),
      year: sDate.getFullYear(),
    })

    return userModel.findOneAndUpdate(
      { tw_id: status.uid },
      { $push: { 'feed': { $each: [ Feed ], $position: 0 } } }, { new: true }, 
    ).select(['user_metadata', 'feed', 'history']).exec()
    .then(user => new Promise(function(resolve, reject) {
      Score.processFeed(user); // Proceso asincrónico del servidor
      resolve(user);
    })) 
  }
  PutFromIG(body) {}
}

module.exports = new HookFacade('Hook', feedSchema)
