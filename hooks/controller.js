const Controller = require('../lib/controller')
const hooksFacade = require('./facade')

class FeedController extends Controller {
  PutFromFB(req, res, next) {
    this.facade.PutFromFB(req.body)
      .then(doc => res.status(201).json(doc))
      .catch(err => next(err))
  }
  PutFromTW(req, res, next) {
    this.facade.PutFromTW(req.body)
      .then(doc => res.status(201).json(doc))
      .catch(err => next(err))
  }
  PutFromIG(req, res, next) {
    this.facade.PutFromIG(req.body)
      .then(doc => res.status(201).json(doc))
      .catch(err => next(err))
  }
}

module.exports = new FeedController(hooksFacade)
