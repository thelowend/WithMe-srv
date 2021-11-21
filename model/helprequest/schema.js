const mongoose = require('mongoose')
const Schema = mongoose.Schema
const feedSchema = require('../feed/schema')
//const ObjectId = Schema.Types.ObjectId

const helpRequestSchema = new Schema({
  user_id: { type: String },
  name: { type: String },
  request_date: { type: Date },
  profile: { type: String },
  overallScore: { type: Number },
  feed: { type: [feedSchema] },
})

module.exports = helpRequestSchema
