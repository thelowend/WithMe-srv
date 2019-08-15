const mongoose = require('mongoose')
const Schema = mongoose.Schema

const feedSchema = new Schema({
  source: { type: String },
  datetime: { type: Date },
  text: { type: String },
  hour: { type: Number },
  day: { type: Number },
  month: { type: Number },
  year: { type: Number },
})

module.exports = feedSchema
