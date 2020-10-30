const mongoose = require('mongoose')
const Schema = mongoose.Schema

const contactSchema = new Schema({
  user_id: { type: String, required: true },
  name: { type: String, required: false },
  contact_date: { type: Date, required: true },
})

module.exports = contactSchema
