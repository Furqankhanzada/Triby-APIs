var express = require('express');
var router = express.Router();
var middleware = require('./../middleware');

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var DeviceSchema = new Schema({
  username: { type: String, required:true },
  device_id: { type: String, unique: true, required:true },
  date_creation: {type: Date, required: true, default:Date.now}
});

var DeviceModel = mongoose.model('Device', DeviceSchema);
module.exports = DeviceModel;



