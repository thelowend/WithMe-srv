const Controller = require('../../lib/controller')
const userFacade = require('./facade')
const hooksFacade = require('../../hooks/facade')
const Evaluation = require('../../services/evaluation')

class UserController extends Controller {
  updateEvaluation(req, res, next) {
    if (req.body.evaluation && Object.keys(req.body.evaluation).length > 0) {
      const result = Evaluation.evaluate(req.body.evaluation, req.params.category);
      this.facade.updateOne({ _id: req.params.id }, { $set: { 'user_metadata.threshold': result } })
        .then((results) => {
          if (results.n < 1) { return res.sendStatus(404) }
          if (results.nModified < 1) { return res.sendStatus(304) }
          return res.status(200).json(results._doc)
        })
        .catch(err => next(err))
    } else {
      return res.sendStatus(404)
    }
  }
  postStatus(req, res, next) {
    //req.params.id, req.params.target, req.body.post
    switch(req.params.target) {
      case 'Twitter':
        return hooksFacade.PutFromTW(req.body.post)
          .then(doc => res.status(201).json(doc))
          .catch(err => next(err))
      case 'Facebook':
        return hooksFacade.PutFromFB(req.body.post)
          .then(doc => res.status(201).json(doc))
          .catch(err => next(err))
      default:
        return res.send(404)
    }

  }
  getContactInfo(req, res, next) {
    return this.facade.getContactInfo(req.params.id)
      .then((doc) => {
        if (!doc) { return res.sendStatus(404) }
        return res.status(200).json(doc)
      })
      .catch(err => next(err))
  }
}

module.exports = new UserController(userFacade)
