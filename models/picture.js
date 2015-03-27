var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');

var mongoose = require('mongoose');
Schema = mongoose.Schema;


var PictureSchema = new Schema({
    parentid: String,
    parenttype: String,
    createdby: String,
    filename: String,
    filelocation: String,
    type: String,
    thumbnail: String,
    thumbnaillocation: String,
    date: Date
});




var PictureModel = mongoose.model('Picture', PictureSchema);
module.exports = PictureModel;
