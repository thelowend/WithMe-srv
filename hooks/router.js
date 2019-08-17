const Router = require('express').Router
const router = new Router()

// Token para validar requests de With Me App en FB Graph API
const token = process.env.TOKEN || 'token';

let received_updates = [];

router.route('/')
  .get((req, rest) => {
    console.log(args);
    res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
  })

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
    // Process the Facebook updates here
    received_updates.unshift(req.body);
    res.sendStatus(200);
  })

router.route('/instagram')
  .get((req, res) => {
  })
  .post((req, res) => {
  })

module.exports = router
