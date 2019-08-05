const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const xhub = require('express-x-hub'); //A compact way to validate X-Hub requests to ensure they have not been tampered with. Particularly useful for Facebook real-time updates and GitHub web hooks.

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

// FB APP_SECRET (With Me App)
app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

// Token para validar requests de With Me App en FB Graph API
const token = process.env.TOKEN || 'token';

let received_updates = [];

app.get('/', (req, res) => {
  console.log(req);
  res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
});

app.get(['/fb', '/instagram'], (req, res) => {
  if (req.query['hub.mode'] == 'subscribe' && req.query['hub.verify_token'] == token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/fb', (req, res) => {
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
});

/*app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});*/