var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var middleware = require('./../middleware');

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var Event = require('./event');

var TribeSchema = new Schema({
    name: String,
    description: String,
    createdby: String,
    privacy: String,
    members: [String],
    rights: [Number],
    events: [String],
    bizs: [String],
    posts: [String],
    lastseen: [{"user":String, "time":Date}],
    pic: String
});


TribeSchema.statics.update = function (req, cb) {
  var query = { _id: req.param('tribeid') }; 
  this.findOneAndUpdate(query, req.body, function(err, tribe){
    if(err || !tribe){
      var ret = middleware.handleDbError(err, tribe);
      cb(null, ret);
      return;
    }
    trb = tribe.toObject();
    delete trb.__v;
	cb(null, trb);  
  });  
}

TribeSchema.statics.setPic = function (req, cb) {
  var query = { _id: req.query.parentid };
  this.findOneAndUpdate(query, {pic:req.pictureid}, function(err, tribe){
    if(err || !tribe){
      var ret = middleware.handleDbError(err, tribe);
      cb(null, ret);
      return;
    }  
    trb = tribe.toObject();
    delete trb.__v;
    cb(null, trb);  
  });
}


TribeSchema.statics.addEvent = function (req, cb) {
  var query = { _id: req.param('tribeid') }; 
  this.findOneAndUpdate(query, {$addToSet: {events:req.eventid}}, function(err, tribe){
    if(err || !tribe){
      var ret = middleware.handleDbError(err, tribe);
      cb(null, ret);
      return;
    }
    trb = tribe.toObject();
    delete trb.__v;
	cb(null, trb);  
  });  
}

TribeSchema.statics.addBiz = function (req, cb) {
  var query = { _id: req.param('tribeid') }; 
  this.findOneAndUpdate(query, {$addToSet: {bizs:req.bizid}}, function(err, tribe){
    if(err || !tribe){
      var ret = middleware.handleDbError(err, tribe);
      cb(null, ret);
      return;
    }
    trb = tribe.toObject();
    delete trb.__v;
	cb(null, trb);  
  });  
}

TribeSchema.statics.addMember = function (req, cb) {
  var query = { _id: req.param('tribeid') };
  console.log(query);
  this.findOneAndUpdate(query, {$addToSet: {members:req.username}}, function(err, tribe){
    if(err || !tribe){
      var ret = middleware.handleDbError(err, tribe);
      cb(null, ret);
      return;
    }
    trb = tribe.toObject();
    delete trb.__v;
	cb(null, trb);  
  });  
}

TribeSchema.statics.removeMember = function (req, cb) {
  var query = { _id: req.param('tribeid') }; 
  this.findOneAndUpdate(query, {$pullAll: {members:req.body.users}}, function(err, tribe){
    if(err || !tribe){
      var ret = middleware.handleDbError(err, tribe);
      cb(null, ret);
      return;
    }
    trb = tribe.toObject();
    delete trb.__v;
	cb(null, trb);  
  });  
}

TribeSchema.statics.findById = function (id, cb) {
  var query = { _id: id };   
  this.findOne(query, function(err, tribe){
    if(err || !tribe){
      var ret = middleware.handleDbError(err, tribe);
      cb(null, ret);
      return;
    }
      
	trb = tribe.toObject();
    delete trb.__v;
	cb(null, trb);  
  });
}

TribeSchema.statics.listEvent = function (tribeid, cb) {
    this.findOne({ _id: tribeid }, function(err, tribe) {
        if(err || !tribe){
          var ret = middleware.handleDbError(err, tribe);
          cb(null, ret);
          return;
        }
        console.log(tribe);
        cb(null, tribe.events);
	});
}


TribeSchema.statics.listBiz = function (tribeid, cb) {
    this.findOne({ _id: tribeid }, function(err, tribe) {
        if(err || !tribe){
          var ret = middleware.handleDbError(err, tribe);
          cb(null, ret);
          return;
        }
       cb(null, tribe.bizs);
    });
}

TribeSchema.statics.listByUser = function (username, cb) {
  this.find( {$or:[{ createdby: username}, {members:{$in:[username]}}]}, function(err, tribes) {
    if(err || !tribes){
      var ret = middleware.handleDbError(err, tribes);
      cb(null, ret);
      return;
    }
    cb(null, tribes);
  });

}

TribeSchema.statics.addPost = function (req, cb) {
    var query = { _id: req.body.parentid };
    this.findOneAndUpdate(query, {$addToSet: {posts:req.postid}}, function(err, tribe){
         if(err || !tribe){
          var ret = middleware.handleDbError(err, tribe);
          cb(null, ret);
          return;
         }
        cb(null, tribe);
    });
}

var TribeModel = mongoose.model('Tribe', TribeSchema);
module.exports = TribeModel;

