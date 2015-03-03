var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var IpeopleSchema = new Schema({
  email: { type: String, unique: true, required: true },
  firstname: String,
  lastname: String,
  regdate: Date
});

IpeopleSchema.statics.list = function (req, cb) {
    this.find( {} , {} , { skip: 25*req.param('page'), limit: 25 }, function(err, ipeoples) {
       if(err || !ipeoples){
          var ret = middleware.handleDbError(err, ipeoples);
          cb(null, ret);
          return;
        }
       cb(null, ipeoples);
	});
}

var IpeopleModel = mongoose.model('Ipeople', IpeopleSchema);
module.exports = IpeopleModel;