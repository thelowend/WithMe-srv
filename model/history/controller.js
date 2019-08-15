const Controller = require('../../lib/controller')
const historyFacade = require('./facade')

class HistoryController extends Controller {}

module.exports = new HistoryController(historyFacade)
