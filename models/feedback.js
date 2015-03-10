var express = require('express');
var router = express.Router();
var middleware = require('./../middleware');

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var FeedbackSchema = new Schema({
  username: { type: String, required:true },
  score: { type: Number, required:true, default:0 },
  text: { type: String },
  date_creation: {type: Date, required: true, default:Date.now}
});

var FeedbackModel = mongoose.model('Feedback', FeedbackSchema);
module.exports = FeedbackModel;