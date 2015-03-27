var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var middleware = require('./../middleware');

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var EventSchema = new Schema({
    name: String,
    description: String,
    createdby: String,
    privacy: String,
    address: String,
    latitude: Number,
    longitude: Number,
    date: Date,
    start: Date,
    end: Date,
    members: [String],
    yes: [String],
    no: [String],
    maybe: [String],
    rights: [Number],
    tribes: [String],
    shakka: [String],
    heart: [String],
    posts: [String],
    lastseen: [{"user":String, "time":Date}],
    comments: [{"comment":String, "user":String, "name":String, "time":Date}],
    pic: String

});

EventSchema.statics.listByUser = function (email, cb) {
    this.find({$or:[{ createdby: email}, {members:{$in:[email]}}]}, function(err, events) {
       if(err || !events){
          var ret = middleware.handleDbError(err, events);
          cb(null, ret);
          return;
        }
	   cb(null, events);
    });
}    


EventSchema.statics.findByIds = function (ids, cb) {
  var query = { _id: { $in: ids } };   
  this.find(query, function(err, events){
     if(err || !events){
          var ret = middleware.handleDbError(err, events);
          cb(null, ret);
          return;
      }
	cb(null, events);
  });
}


EventSchema.statics.findById = function (id, cb) {
  var query = { _id: id };   
  this.findOne(query, function(err, event){
    if(err || !event){
          var ret = middleware.handleDbError(err, event);
          cb(null, ret);
          return;
      }
	evt = event.toObject();
    delete evt.__v;
	cb(null, evt);
  });
}

EventSchema.statics.setPic = function (req, cb) {
  var query = { _id: req.query.parentid };
  this.findOneAndUpdate(query, {pic:req.pictureid}, function(err, event){
    if(err || !event){
          var ret = middleware.handleDbError(err, event);
          cb(null, ret);
          return;
      }
    evt = event.toObject();
    delete evt.__v;
    cb(null, evt);
  });
}

EventSchema.statics.update = function (req, cb) {
    var query = { _id: req.param('eventid') };
    delete req.body.tribes;
    this.findOneAndUpdate(query, req.body, function(err, event){
        if(err || !event){
          var ret = middleware.handleDbError(err, event);
          cb(null, ret);
          return;
        }
        cb(null, event);
    });
}


EventSchema.statics.addPost = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {posts:req.postid}}, function(err, event){
        if(err || !event){
          var ret = middleware.handleDbError(err, event);
          cb(null, ret);
          return;
        }
        cb(null, event); 
    });    
}

EventSchema.statics.addToShakka = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {shakka:req.user}}, function(err, event){
        if(err || !event){
          var ret = middleware.handleDbError(err, event);
          cb(null, ret);
          return;
        }
        cb(null, event); 
    });    
}

EventSchema.statics.removeShakka = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {shakka:req.user}}, function(err, event){
        if(err || !event){
          var ret = middleware.handleDbError(err, event);
          cb(null, ret);
          return;
        }
        cb(null, event);
    });
}

EventSchema.statics.addToHeart = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {heart:req.user}}, function(err, event){
        if(err || !event){
          var ret = middleware.handleDbError(err, event);
          cb(null, ret);
          return;
        }
        cb(null, event); 
    });    
}

EventSchema.statics.removeHeart = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {heart:req.user}}, function(err, event){
        if(err || !event){
          var ret = middleware.handleDbError(err, event);
          cb(null, ret);
          return;
        }
        cb(null, event);
    });
}

EventSchema.statics.addComment = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {comments:{"comment":req.body.comment, "user":req.user, "name":req.name, "time":new Date()}}}, function(err, event){
        if(err || !event){
          var ret = middleware.handleDbError(err, event);
          cb(null, ret);
          return;
        }
        cb(null, event);
    });    
}

EventSchema.statics.removeComment = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {comments:{_id:req.body.commentid}}}, function(err, event){
        if(err || !event){
          var ret = middleware.handleDbError(err, event);
          cb(null, ret);
          return;
        }
        cb(null, event);
    });    
}

EventSchema.statics.addToInvite = function (req, cb) {
    var query = { _id: req.param('eventid') };
    var type = req.body.response;
    
    if(type == 'yes'){
        this.findOneAndUpdate(query, {$addToSet: {yes:req.user}, $pull: {no:req.user,maybe:req.user}}, function(err, event){
            if(err || !event){
              var ret = middleware.handleDbError(err, event);
              cb(null, ret);
              return;
            }
            cb(null, event);
        });
    }else if(type == 'no'){
        this.findOneAndUpdate(query, {$addToSet: {no:req.user}, $pull: {yes:req.user,maybe:req.user}}, function(err, event){
            if(err || !event){
              var ret = middleware.handleDbError(err, event);
              cb(null, ret);
              return;
            }
            cb(null, event); 
        });
    }else if(type == 'maybe'){
        this.findOneAndUpdate(query, {$addToSet: {maybe:req.user}, $pull: {yes:req.user,no:req.user}}, function(err, event){
            if(err || !event){
              var ret = middleware.handleDbError(err, event);
              cb(null, ret);
              return;
            }
            cb(null, event);
        });
    }
    
}


var EventModel = mongoose.model('Event', EventSchema);
module.exports = EventModel;
