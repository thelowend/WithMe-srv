const Controller = require('../../lib/controller')
const feedFacade = require('./facade')

class FeedController extends Controller {}

module.exports = new FeedController(feedFacade)
