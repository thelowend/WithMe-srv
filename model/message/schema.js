const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
  from: { type: String, required: true },
  seen: { type: Boolean, required: false, default: false },
  date_sent: { type: Date, required: true },
  date_seen: { type: Date, required: false },
})

module.exports = messageSchema
