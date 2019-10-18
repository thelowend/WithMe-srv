const Facade = require('../../lib/facade')
const userSchema = require('./schema')

class UserFacade extends Facade {
    getContactInfo (...args) {
        return this.Model
          .findById(...args, 'email user_metadata feed history')
          .exec()
      }

}

module.exports = new UserFacade('User', userSchema)
