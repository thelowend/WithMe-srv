const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const bluebird = require('bluebird')

const config = require('./config')
const routes = require('./routes')

//A compact way to validate X-Hub requests to ensure they have not been tampered with. Particularly useful for Facebook real-time updates and GitHub web hooks.
const xhub = require('express-x-hub'); 

const app = express()

mongoose.Promise = bluebird
mongoose.connect(config.mongo.url, {dbName: 'withmedb'})

app.use(helmet())

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET })); // FB

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(morgan('tiny'))

app.use('/', routes)

app.listen(config.server.port, () => {
  console.log(`Magic happens on port ${config.server.port}`)
})

module.exports = app
