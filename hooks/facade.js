const mongoose = require('mongoose')
const Facade = require('../lib/facade')
const feedSchema = require('../model/feed/schema')
const userSchema = require('../model/user/schema')

const Score = require('../services/score') // Servicio de scoring (nuestro algoritmo)

class HookFacade extends Facade {
  PutFromFB(body) {
    const status = body.entry[0]; // El estado de FB del usuario
    const sDate = new Date(status.time * 1000); // Se multiplica por 1000 porque de fecha de FB viene dividido por 1000
    const sText = status.changes[0].value.trim();

    // FACEBOOK WEBHOOK TEST
    if (status.changes[0].id = '44444444_444444444') {
      status.uid = '5da29f784cb41b00068e21a9'; // test user
      sText = 'Everything hurts and it is extremely sad. I do not want it anymore nor I desire it for anyone else.';
      sDate = new Date();
    }

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
      Score.processFeed(user); // Proceso asincrónico del servidor
      resolve(user);
    }))
    

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
