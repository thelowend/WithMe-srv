const Facade = require('../../lib/facade')
const historySchema = require('./schema')

class HistoryFacade extends Facade {}

module.exports = new HistoryFacade('History', historySchema)
