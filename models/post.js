var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var middleware = require('./../middleware');
var mongoose = require('mongoose');
Schema = mongoose.Schema;

var PostSchema = new Schema({
    createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
    content: String,
    privacy: String,
    pic: String,
    date: Date,
    parentType: String,
    parentID: String,
    likes: [String],
    dislikes: [String],
    hearts: [String],
    comments: [{
        "comment":String,
        "user": {type: Schema.Types.ObjectId, ref: 'User'} ,
        "pic": String,
        "time":Date,
        "likes": [String],
        "dislikes": [String],
        "hearts": [String]
    }]
});

PostSchema.statics.findById = function (id, cb) {
  var query = { _id: id };
  this.findOne(query).populate('createdBy comments.user').exec(function(err, post){
      if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
      }

      pt = post.toObject();
      delete pt.__v;
      cb(null, pt);
  });
};

PostSchema.statics.removeById = function (id, cb) {
  var query = { _id: id };   
  this.remove(query, function(err){
	cb(null, {"status":"success"});
  });
};

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
};

PostSchema.statics.findByParent = function (req, cb) {
  var query = { parentID: req.params.parentid };
  this.find(query).populate('createdBy').exec(function(err, posts){
      if(err || !posts){
          var ret = middleware.handleDbError(err, posts);
          cb(null, ret);
          return;
      }

      cb(null, posts);
  });
};

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
};

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
};

PostSchema.statics.addToLike = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {likes:req.userId}, $pull: {dislikes:req.userId, hearts: req.userId}}, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);   
    });    
};

PostSchema.statics.removeLike = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {likes:req.userId}}, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);  
    });
};

PostSchema.statics.commentAddToLike = function (req, cb) {
    var query = { _id: req.body.id, "comments._id": req.body.comment_id };
    this.findOneAndUpdate(query, {$addToSet: {"comments.$.likes":req.userId}, $pull: {"comments.$.dislikes":req.userId, "comments.$.hearts": req.userId}}
        ,function(err, post)
    {
        if (err || !post) {
            var ret = middleware.handleDbError(err, post);
            cb(null, ret);
            return;
        }
        cb(null, post);
  })
};

PostSchema.statics.commentRemoveLike = function (req, cb) {
    var query = { _id: req.body.id, "comments._id": req.body.comment_id };
    this.findOneAndUpdate(query, {$pull: {"comments.$.likes":req.userId}}, function(err, post){
        if(err || !post){
            var ret = middleware.handleDbError(err, post);
            cb(null, ret);
            return;
        }
        cb(null, post);
    });
};

PostSchema.statics.addToDislike = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {dislikes:req.userId}, $pull: {likes:req.userId, hearts: req.userId}}, function(err, post){
        if(err || !post){
            var ret = middleware.handleDbError(err, post);
            cb(null, ret);
            return;
        }
        cb(null, post);
    });
};

PostSchema.statics.removeDislike = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {dislikes:req.userId}}, function(err, post){
        if(err || !post){
            var ret = middleware.handleDbError(err, post);
            cb(null, ret);
            return;
        }
        cb(null, post);
    });
};

PostSchema.statics.commentAddToDislike = function (req, cb) {
    var query = { _id: req.body.id, "comments._id": req.body.comment_id };
    this.findOneAndUpdate(query, {$addToSet: {"comments.$.dislikes":req.userId}, $pull: {"comments.$.likes":req.userId, "comments.$.hearts": req.userId}}
        ,function(err, post)
        {
            if (err || !post) {
                var ret = middleware.handleDbError(err, post);
                cb(null, ret);
                return;
            }
            cb(null, post);
        })
};

PostSchema.statics.commentRemoveDislike = function (req, cb) {
    var query = { _id: req.body.id, "comments._id": req.body.comment_id };
    this.findOneAndUpdate(query, {$pull: {"comments.$.dislikes":req.userId}}, function(err, post){
        if(err || !post){
            var ret = middleware.handleDbError(err, post);
            cb(null, ret);
            return;
        }
        cb(null, post);
    });
};

PostSchema.statics.addToHeart = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {hearts:req.userId}, $pull: {likes:req.userId, dislikes: req.userId}}, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);   
    });    
};

PostSchema.statics.removeHeart = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$pull: {hearts:req.userId}}, function(err, post){
        if(err || !post){
          var ret = middleware.handleDbError(err, post);
          cb(null, ret);
          return;
        }
        cb(null, post);  
    });
};

PostSchema.statics.commentAddToHeart = function (req, cb) {
    var query = { _id: req.body.id, "comments._id": req.body.comment_id };
    this.findOneAndUpdate(query, {$addToSet: {"comments.$.hearts":req.userId}, $pull: {"comments.$.dislikes":req.userId, "comments.$.likes": req.userId}}
        ,function(err, post)
        {
            if (err || !post) {
                var ret = middleware.handleDbError(err, post);
                cb(null, ret);
                return;
            }
            cb(null, post);
        })
};

PostSchema.statics.commentRemoveHeart = function (req, cb) {
    var query = { _id: req.body.id, "comments._id": req.body.comment_id };
    this.findOneAndUpdate(query, {$pull: {"comments.$.hearts":req.userId}}, function(err, post){
        if(err || !post){
            var ret = middleware.handleDbError(err, post);
            cb(null, ret);
            return;
        }
        cb(null, post);
    });
};

PostSchema.statics.addComment = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {comments:{"comment":req.body.comment, "user": req.userId, "time":new Date(), "pic":req.body.pic}}})
        .populate('comments.user').exec(function(err, post){
            if(err || !post){
                var ret = middleware.handleDbError(err, post);
                cb(null, ret);
                return;
            }
            cb(null, post);
        });
};

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
};

var PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;