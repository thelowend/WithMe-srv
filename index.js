const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const bluebird = require('bluebird')

const config = require('./config')
const routes = require('./routes')
const cors = require('cors')

//A compact way to validate X-Hub requests to ensure they have not been tampered with. Particularly useful for Facebook real-time updates and GitHub web hooks.
const xhub = require('express-x-hub'); 

const app = express()

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.Promise = bluebird
mongoose.connect(config.mongo.url, {dbName: 'withmedb'})

app.use(helmet())

// Autenticación de los requests al backend
app.use(function(req, res, next) {
  var auth;
  // check whether an autorization header was send    
  if (req.headers.authorization) {
    auth = Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':');
  }
  if (!auth || auth[0] !== process.env.BACKEND_USERNAME || auth[1] !== process.env.BACKEND_PASSWORD) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="WithMeSrv"');
      res.end('Unauthorized');
  } else {
      next();
  }
});

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET })); // FB

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(morgan('tiny'))

/* Para hacer whitelist de URLs cuando salga la versión "comercial".
const whitelist = ['http://example1.com', 'http://example2.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
// Then pass them to cors:
app.use(cors(corsOptions));
*/

app.use(cors())

app.use('/', routes)

app.listen(config.server.port, () => {
  console.log(`Servidor de With Me App iniciado en el puerto ${config.server.port}`)
})

module.exports = app
