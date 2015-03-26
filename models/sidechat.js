var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var middleware = require('./../middleware');
var mongoose = require('mongoose');
Schema = mongoose.Schema;

var SideChatSchema = new Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    time:Date,
    comments: [{"comment":String, "user": {type: Schema.Types.ObjectId, ref: 'User'} , "time":Date}]
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
    this.findOneAndUpdate(query, {$addToSet: {comments:{"comment":req.body.comment, "user": req.userId, "time":new Date()}}})
        .populate('comments.user').exec(function(err, chat){
            if(err || !chat){
                var ret = middleware.handleDbError(err, chat);
                cb(null, ret);
                return;
            }
            cb(null, chat);
        });
};

var SideChatModel = mongoose.model('SideChat', SideChatSchema);
module.exports = SideChatModel;