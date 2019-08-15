const mongoose = require('mongoose')
const Schema = mongoose.Schema
const feedSchema = require('../feed/schema')
const historySchema = require('../history/schema')

const userSchema = new Schema({
  tenant: { type: String },
  connection: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  email_verified: Boolean,
  fb_sync: Boolean,
  tw_sync: Boolean,
  feed: [feedSchema],
  history: [historySchema]
})

module.exports = userSchema
