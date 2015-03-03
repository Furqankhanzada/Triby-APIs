var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var middleware = require('./../middleware');

var mongoose = require('mongoose');
Schema = mongoose.Schema;

var BizSchema = new Schema({
    name: String,
    description: String,
    createdby: String,
    privacy: String,
    address: String,
    latitude: Number,
    longitude: Number,
    members: [String],
    rights: [Number],
    tribes: [String],
    shakka: [String],
    comments: [{"comment":String, "user":String, "name":String, "time":Date}], 
    posts: [String],
    pic: String
});

BizSchema.statics.listByUser = function (email, cb) {
    this.find({ createdby: email }, function(err, bizs) {
        if(err || !bizs){
          var ret = middleware.handleDbError(err, bizs);
          cb(null, ret);
          return;
        }
	   cb(null, bizs);	
    });
}


BizSchema.statics.findByIds = function (ids, cb) {
  var query = { _id: { $in: ids } };   
  this.find(query, function(err, bizs){
    if(err || !bizs){
      var ret = middleware.handleDbError(err, bizs);
      cb(null, ret);
      return;
    }
	cb(null, bizs);
  });
}


BizSchema.statics.findById = function (id, cb) {
  var query = { _id: id };   
  this.findOne(query, function(err, biz){
    if(err || !biz){
      var ret = middleware.handleDbError(err, biz);
      cb(null, ret);
      return;
    }
	bz = biz.toObject();
    delete bz.__v;
	cb(null, bz);
  });
}

BizSchema.statics.setPic = function (req, cb) {
  var query = { _id: req.query.parentid };
  this.findOneAndUpdate(query, {pic:req.pictureid}, function(err, biz){
    if(err || !biz){
      var ret = middleware.handleDbError(err, biz);
      cb(null, ret);
      return;
    }
    bz = biz.toObject();
    delete bz.__v;
    cb(null, bz);
  });
}

BizSchema.statics.update = function (req, cb) {
    var query = { _id: req.param('bizid') };
    delete req.body.tribes;
    this.findOneAndUpdate(query, req.body, function(err, biz){
        if(err || !biz){
          var ret = middleware.handleDbError(err, biz);
          cb(null, ret);
          return;
        }
        cb(null, biz);   
    });
}

BizSchema.statics.addToShakka = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {shakka:req.user}}, function(err, biz){
       if(err || !biz){
          var ret = middleware.handleDbError(err, biz);
          cb(null, ret);
          return;
        }
       cb(null, biz);
    });
}

BizSchema.statics.removeShakka = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {shakka:req.user}}, function(err, biz){
        if(err || !biz){
          var ret = middleware.handleDbError(err, biz);
          cb(null, ret);
          return;
        }
        cb(null, biz);
    });
}

BizSchema.statics.addComment = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {comments:{"comment":req.body.comment, "user":req.user, "name":req.name, "time":new Date()}}}, function(err, biz){
        if(err || !biz){
          var ret = middleware.handleDbError(err, biz);
          cb(null, ret);
          return;
        }
        cb(null, biz);   
    });    
}

BizSchema.statics.removeComment = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {comments:{_id:req.body.commentid}}}, function(err, biz){
        if(err || !biz){
          var ret = middleware.handleDbError(err, biz);
          cb(null, ret);
          return;
        }
        cb(null, biz);   
    });    
}

BizSchema.statics.addPost = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {posts:req.postid}}, function(err, biz){
        if(err || !biz){
          var ret = middleware.handleDbError(err, biz);
          cb(null, ret);
          return;
        }
        cb(null, biz);
    });
}

var BizModel = mongoose.model('Biz', BizSchema);
module.exports = BizModel;
