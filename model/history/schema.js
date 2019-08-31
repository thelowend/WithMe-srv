const mongoose = require('mongoose')
const Schema = mongoose.Schema

const historySchema = new Schema({
  score: { type: Number, required: true },
  datetime: { type: Date, required: true }
})

module.exports = historySchema
