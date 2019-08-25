const mongoose = require('mongoose')
const Schema = mongoose.Schema
const feedSchema = require('../feed/schema')
const historySchema = require('../history/schema')

const userSchema = new Schema({
  tenant: { type: String },
  client_id: { type: String },
  connection: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  user_metadata: { type: Object },
  request_language: { type: String },
  email_verified: Boolean,
  age: { type: Number, required: true },
  profile: { type: String, required: true },
  threshold: { type: Number },
  fb_id: { type: String },
  fb_sync: Boolean,
  tw_id: { type: String },
  tw_sync: Boolean,
  ig_id: { type: String },
  ig_sync: Boolean,
  feed: [feedSchema],
  history: [historySchema]
})

module.exports = userSchema
