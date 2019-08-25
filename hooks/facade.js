const mongoose = require('mongoose')
const Facade = require('../lib/facade')
const feedSchema = require('../model/feed/schema')
const historySchema = require('../model/history/schema')
const userSchema = require('../model/user/schema')

const NLU = require('../services/nlu') // Servicio de NLU

class HookFacade extends Facade {
  async PutFromFB(body) {
    const status = body.entry[0]; // El estado de FB del usuario
    const sDate = new Date(status.time * 1000); // Se multiplica por 1000 porque de fecha de FB viene dividido por 1000
    const sText = status.changes[0].value.trim();

    const userModel = mongoose.model('user', userSchema);
    const feedModel = mongoose.model('feed', feedSchema);
    const historyModel = mongoose.model('history', historySchema);

    const analysisResults = await NLU.analyzeText(sText)
    console.log(JSON.stringify(analysisResults, null, 2));

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
    debugger;

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
      { $push: { 'feed': { $each: [ Feed ], $position: 0 } } }
    ).exec()

  }
  PutFromTW(body) {}
  PutFromIG(body) {}
}

module.exports = new HookFacade('Hook', feedSchema)
