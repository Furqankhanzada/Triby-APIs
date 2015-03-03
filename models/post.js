var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var middleware = require('./../middleware');
var mongoose = require('mongoose');
Schema = mongoose.Schema;

var PostSchema = new Schema({
    createdby: String,
    content: String,
    privacy: String,
    pic: String,
    date: Date,
    parentType: String,
    parentID: String,
    shakka: [String],
    heart: [String],
    comments: [{"comment":String, "user":String, "name":String, "time":Date}],

});

PostSchema.statics.findById = function (id, cb) {
  var query = { _id: id };   
  this.findOne(query, function(err, post){
    if(err || !post){
      var ret = middleware.handleDbError(err, post);
      cb(null, ret);
      return;
    }  
      
	pt = post.toObject();
    delete pt.__v;
	cb(null, pt);  
  });
}

PostSchema.statics.removeById = function (id, cb) {
  var query = { _id: id };   
  this.remove(query, function(err){
	cb(null, {"status":"success"});
  });
}

PostSchema.statics.findByIds = function (ids, cb) {
  var query = { _id: { $in: ids } };   
  this.find(query, function(err, posts){
    if(err || !posts){
      var ret = middleware.handleDbError(err, posts);
      cb(null, ret);
      return;
    }  
	cb(null, posts);  
  });
}

PostSchema.statics.findByParent = function (req, cb) {
  var query = { parentID: req.query.parentid };   
  this.find(query, function(err, posts){
    if(err || !posts){
      var ret = middleware.handleDbError(err, posts);
      cb(null, ret);
      return;
    }
     
	cb(null, posts);
  });
}

PostSchema.statics.findByParents = function (req, cb) {
  var query = { parentID: { $in: req.body.parentids }};   
  this.find(query, function(err, posts){
    if(err || !posts){
      var ret = middleware.handleDbError(err, posts);
      cb(null, ret);
      return;
    }
    cb(null, posts);
  });
}

PostSchema.statics.update = function (req, cb) {
    var query = { _id: req.param('postid') };
    this.findOneAndUpdate(query, req.body, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);  
    });
}

PostSchema.statics.addToShakka = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {shakka:req.user}}, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);   
    });    
}

PostSchema.statics.removeShakka = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {shakka:req.user}}, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);  
    });
}

PostSchema.statics.addToHeart = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {heart:req.user}}, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);   
    });    
}

PostSchema.statics.removeHeart = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {heart:req.user}}, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);  
    });
}

PostSchema.statics.addComment = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {comments:{"comment":req.body.comment, "user":req.user, "name":req.name, "time":new Date()}}}, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);  
    });    
}

PostSchema.statics.removeComment = function (req, cb) {
    console.log('post delete schema');
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {comments:{_id:req.body.commentid}}}, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);  
    });    
}

var PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;