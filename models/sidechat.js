var express = require('express');
var router = express.Router();
var uuid = require('node-uuid');
var middleware = require('./../middleware');
var mongoose = require('mongoose');
Schema = mongoose.Schema;

var SideChatSchema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    time:Date,
    comments: [{
        "comment":String,
        "user": {type: Schema.Types.ObjectId, ref: 'User'},
        "pic": String,
        "time":Date,
        "likes": [String],
        "dislikes": [String],
        "hearts": [String]
         }]
});

SideChatSchema.statics.findByUserId = function (owner_id, id, cb) {
    var query = { owner: owner_id, user: id };
    this.findOne(query).populate('comments.user').exec(function(err, chat){
        if(err || !chat){
            var ret = middleware.handleDbError(err, chat);
            cb(ret);
            return;
        }
        sidechat = chat.toObject();
        delete sidechat.__v;
        cb(null, sidechat);
    });
};

SideChatSchema.statics.findByOwnerId = function (id, cb) {
    var query = { owner: id };
    this.find(query).populate('comments.user').exec(function(err, chat){
        if(err || !chat){
            var ret = middleware.handleDbError(err, chat);
            cb(ret);
            return;
        }
        sidechat = chat.toObject();
        delete sidechat.__v;
        cb(null, sidechat);
    });
};

SideChatSchema.statics.addComment = function (req, cb) {
    var query = { _id: req.body.id };
    this.findOneAndUpdate(query, {$addToSet: {comments:{"comment":req.body.comment, "user": req.userId, "time":new Date(), "pic": req.body.pic}}})
        .populate('comments.user').exec(function(err, chat){
            if(err || !chat){
                var ret = middleware.handleDbError(err, chat);
                cb(null, ret);
                return;
            }
            cb(null, chat);
        });
};


SideChatSchema.statics.commentAddToLike = function (req, cb) {
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

SideChatSchema.statics.commentRemoveLike = function (req, cb) {
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

SideChatSchema.statics.commentAddToDislike = function (req, cb) {
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

SideChatSchema.statics.commentRemoveDislike = function (req, cb) {
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

SideChatSchema.statics.commentAddToHeart = function (req, cb) {
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

SideChatSchema.statics.commentRemoveHeart = function (req, cb) {
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
var SideChatModel = mongoose.model('SideChat', SideChatSchema);
module.exports = SideChatModel;