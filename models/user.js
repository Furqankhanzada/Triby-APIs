var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var middleware = require('./../middleware');

var mongoose = require('mongoose');
Schema = mongoose.Schema;
var Token = require('./token');

var UserSchema = new Schema({
  username: { type: String, unique: true, required:true },
  mobilenumber: { type: String, unique: true, required:true },
  code: { type: Number, required:true },
  status: {type: Number, required:true, default:0},
  email: { type: String},
  hashed_password: { type: String},
  salt: { type: String },
  firstname: String,
  lastname: String,
  bio: String,
  city: String,
  country: String,
  dob: Date,
  pic: String
});


UserSchema.statics.findByUserName = function (aUserName, cb) {
  this.findOne({ username: aUserName }, function(err, user) {
    if(err || !user){
      var ret = middleware.handleDbError(err, user);
      cb(null, ret);
      return;
    }  
    
    usr = user.toObject();  
    delete usr.__v;
    delete usr._id;
    delete usr.hashed_password ;
    delete usr.salt;

    cb(null, usr);
    
  });
}

  UserSchema.statics.update = function (req, cb) {
    var query = { email: req.user };
    if(req.body.password != undefined){
        var salt = bcrypt.genSaltSync(10);
        req.body.salt = salt;
        req.body.hashed_password = bcrypt.hashSync(req.body.password, salt);
    }
    
    this.findOneAndUpdate(query, req.body, function(err, user){
        if(err || !user){
          var ret = middleware.handleDbError(err, user);
          cb(null, ret);
          return;
        }
        
        usr = user.toObject();
        delete usr.__v;
        delete usr._id;
        delete usr.salt;
        delete usr.hashed_password;
        cb(null, usr);
    });   
          
  }
  
  UserSchema.statics.setPic = function (req, cb) {
      var query = { email: req.user };
      this.findOneAndUpdate(query, {pic:req.pictureid}, function(err, user){
        if(err || !user){
          var ret = middleware.handleDbError(err, user);
          cb(null, ret);
          return;
        }  
          
        usr = user.toObject();
        delete usr.__v;
        delete usr._id;
        delete usr.salt;
        delete usr.hashed_password;
        cb(null, usr);
      });
  }

  UserSchema.statics.authenticate = function (body, cb) {
  this.findOne({ email: body.email }, function(err, user) {
    if(err || !user){
      var ret = middleware.handleDbError(err, user);
      cb(null, ret);
      return;
    }  
      
    hashed_password = bcrypt.hashSync(body.password, user.salt);
	
    if (hashed_password != user.hashed_password) return cb(err);
      usr = user.toObject();
      var token = new Token();
      token.token = uuid.v4();
      token.email = usr.email;

      token.save(function () { 
      
      tkn = token.toObject();
      delete tkn.__v;
	  delete tkn.email;
      delete tkn._id;
	  cb(null, tkn);

    }); 	
  });
  }

 var UserModel = mongoose.model('User', UserSchema);
 module.exports = UserModel;



