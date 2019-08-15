const mongoose = require('mongoose')
const Schema = mongoose.Schema

const historySchema = new Schema({
  score: { type: Number, required: true },
  date: { type: Date, required: true }
})

module.exports = historySchema
