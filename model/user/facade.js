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
  getMetaData(...args) {
    return this.Model
      .findById(...args, 'user_metadata')
      .exec()
  }
  getUserMessages(...args) {
    return this.Model
      .findById(...args, 'messages')
      .exec().then((user) => {
        return Promise.resolve(user.messages)
      }).catch((err) => {
        console.log(err);
        return Promise.reject(err)
      })
  }
  addContact(helperid, userid, username) {
    // Cuando el voluntario asiste a un usuario, ésta se añade a sus contactos y el voluntario es añadido a los contactos del usuario.
    debugger;
    const contactModel = mongoose.model('contact', contactSchema);
    const Contact = new contactModel({
      helper_id: helperid,
      name: username,
      contact_date: new Date(),
    });

    // Hacer una para el helper también.

    this.Model.findById(helperid)
      .then( helper => {

      }).catch(err => {

      });

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
