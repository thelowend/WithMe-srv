const Controller = require('../../lib/controller')
const userFacade = require('./facade')
const hooksFacade = require('../../hooks/facade')
const Evaluation = require('../../services/evaluation')

class UserController extends Controller {
  findHelpers(req, res, next) {
    return this.facade.findHelpers()
    .then((doc) => {
      if (!doc) { return res.sendStatus(404) }
      return res.status(200).json(doc)
    })
    .catch(err => next(err))
  }
  approveHelper(req, res, next) {
    return this.facade.approveHelper(req.params.id)
    .then((doc) => {
      if (!doc) { return res.sendStatus(404) }
      return res.status(200).json(doc)
    })
    .catch(err => next(err))
  }
  disapproveHelper(req, res, next) {
    return this.facade.disapproveHelper(req.params.id)
    .then((doc) => {
      if (!doc) { return res.sendStatus(404) }
      return res.status(200).json(doc)
    })
    .catch(err => next(err))
  }
  updateEvaluation(req, res, next) {
    if (req.body.evaluation && Object.keys(req.body.evaluation).length > 0) {
      const mentalProfile = Evaluation.evaluate(req.body.evaluation, req.params.category);
      this.facade.updateOne({ _id: req.params.id }, {
        $set: {
          'user_metadata.threshold': mentalProfile.threshold,
          'user_metadata.mental_profile': mentalProfile.description,
        }
      })
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
    switch (req.params.target) {
      case 'Twitter':
        return hooksFacade.PutFromTW(req.body.post)
          .then(doc => res.status(201).json(doc))
          .catch(err => next(err))
      case 'Facebook':
        return hooksFacade.PutFromFB(req.body.post)
          .then(doc => res.status(201).json(doc))
          .catch(err => next(err))
      case 'WithMeApp':
        return hooksFacade.PutFromWithMeApp(req.body.post)
          .then(doc => res.status(201).json(doc))
          .catch(err => next(err))
      case 'Instagram':
        return hooksFacade.PutFromIG(req.body.post)
          .then(doc => res.status(201).json(doc))
          .catch(err => next(err))
      default:
        return res.sendStatus(404)
    }

  }
  getMetaData(req, res, next) {
    return this.facade.getMetaData(req.params.id)
      .then((doc) => {
        if (!doc) { return res.sendStatus(404) }
        return res.status(200).json(doc)
      })
      .catch(err => next(err))
  }
  addContact(req, res, next) {
    return this.facade.addContact(req.params.id, req.body.helpername, req.params.contactid, req.body.username)
      .then((doc) => {
        if (!doc) { return res.sendStatus(404) }
        return res.status(200).json(doc)
      })
      .catch(err => next(err))
  }
  removeContact(req, res, next) {
    return this.facade.removeContact(req.params.id, req.params.contactid)
      .then(doc => res.status(200).json(doc))
      .catch(err => next(err))
  }
  deleteContacts(req, res, next) {
    return this.facade.deleteContacts(req.params.id)
      .then(doc => res.status(200).json(doc))
      .catch(err => next(err))
  }
  getUserMessages(req, res, next) {
    return this.facade.getUserMessages(req.params.id)
      .then(doc => res.status(200).json(doc))
      .catch(err => next(err))
  }
  getUserWithFeed(req, res, next) {
    return this.facade.getUserWithFeed(req.params.id)
    .then(doc => res.status(200).json(doc))
    .catch(err => next(err))
  }
  generateFeed(req, res, next) {
    return hooksFacade.PutMultiple(req.params.id, parseInt(req.params.num), parseInt(req.params.sad))
      .then(doc => res.status(200).json(doc))
      .catch(err => next(err))
  }
  clearFeed(req, res, next) {
    return hooksFacade.clearFeed(req.params.id)
      .then(doc => res.status(200).json(doc))
      .catch(err => next(err))
  }
  clearHistory(req, res, next) {
    return hooksFacade.clearHistory(req.params.id)
      .then(doc => res.status(200).json(doc))
      .catch(err => next(err))
  }
}

module.exports = new UserController(userFacade)
