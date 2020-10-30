const Controller = require('../../lib/controller')
const helpFacade = require('./facade')

class HelpController extends Controller {
    postHelpRequest(req, res, next) {
        this.facade.postHelpRequest(req.body.user_id)
          .then(doc => res.status(201).json(doc))
          .catch(err => next(err))
      }
}

module.exports = new HelpController(helpFacade)
