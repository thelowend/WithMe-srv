const Facade = require('../../lib/facade')
const feedSchema = require('./schema')

class FeedFacade extends Facade {}

module.exports = new FeedFacade('Feed', feedSchema)
