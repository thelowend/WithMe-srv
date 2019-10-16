const Controller = require('../../lib/controller')
const userFacade = require('./facade')

class UserController extends Controller {
    updateEvaluation(req, res, next) {
        this.facade.updateOne({ _id: req.params.id }, req.body, { new: true })
          .then((results) => {
            if (results.n < 1) { return res.sendStatus(404) }
            if (results.nModified < 1) { return res.sendStatus(304) }
            return res.status(200).json(results._doc)
          })
          .catch(err => next(err))
      }
}

module.exports = new UserController(userFacade)
