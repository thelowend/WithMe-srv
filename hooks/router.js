const controller = require('./controller')
const Router = require('express').Router
const router = new Router()

// Token para validar requests de With Me App en FB Graph API
const token = process.env.TOKEN || 'token';

let received_updates = [];

router.route('/')
  .get((req, res) => {
    res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
  })

/*
const NLU = require('../services/nlu') // Servicio de NLU
const posts = require('../evaluation/samples/posts');
const Logger = require('../services/logger');
const logger = new Logger();

router.route('/processfiles')
  .post((req, res) => {
    for (let i = 0; i < posts.happy.length; i++) {
      setTimeout(function () {
        NLU.analyzeText(posts.happy[i]).then(function(analysisResults) {
          const result = JSON.stringify(analysisResults)
          logger.info('happy | ' + result);
        });
      }, 1500);
    }
    for (let i = 0; i < posts.sad.length; i++) {
      setTimeout(function () {
        NLU.analyzeText(posts.sad[i]).then(function(analysisResults) {
          const result = JSON.stringify(analysisResults)
          logger.info('sad | ' + result);
        });
      }, 1500);
    }
    console.log('processing posts');
    res.send('<pre>thanks</pre>');
  });
*/

router.route('/fb')
  .get((req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === token) {
      res.send(req.query['hub.challenge']);
    } else {
      res.sendStatus(400);
    }
  })
  .post((req, res) => {
    console.log('Facebook request body:', req.body);
    if (!req.isXHubValid()) {
      console.log('Warning - request header X-Hub-Signature not present or invalid');
      res.sendStatus(401);
      return;
    }
    console.log('request header X-Hub-Signature validated');
    received_updates.unshift(req.body);

    req.body.entry[0].uid = '5da29f784cb41b00068e21a9'; // test user
    req.body.entry[0].changes[0].value = 'Everything hurts and it is extremely sad. I do not want it anymore nor I desire it for anyone else.';

    return controller.PutFromFB(req, res)
  })
  .put((...args) => controller.PutFromFB(...args))

router.route('/tw')
.put((...args) => controller.PutFromTW(...args))

router.route('/ig')
  .get((req, res) => {
  })
  .post((req, res) => {
  })

module.exports = router
