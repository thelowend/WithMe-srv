const mongoose = require('mongoose');
const Facade = require('../../lib/facade');
const contactSchema = require('../contact/schema');
const userSchema = require('./schema')

class UserFacade extends Facade {
  getUserWithFeed(...args) {
    return this.Model
      .findById(...args, 'user_metadata feed')
      .exec()
  }
  getContactInfo(...args) {
    return this.Model
      .findById(...args, 'email user_metadata feed history')
      .exec()
  }
  addContact(userid, clientid) {
    debugger;
    // TODO
    const contactModel = mongoose.model('contact', contactSchema);
    const Contact = new contactModel({
      user_id: clientid,
      name: 'testname',
      contact_date: new Date(),
    })
    return this.Model.findOneAndUpdate(
      { _id: userid },
      {
        $push: {
          'contacts': {
            $each: [Contact], $position: 0
          }
        }
      }, { new: true },
    );
  }

}

module.exports = new UserFacade('User', userSchema)
