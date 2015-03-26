var express = require('express');
var router = express.Router();
var middleware = require('./../middleware');
var SideChat = require('./../models').SideChat;
var Tribe = require('./../models').Tribe;
var Biz = require('./../models').Biz;

router.post('/sidechat', middleware.requiresUser, function(req, res) {
    SideChat.findByUserId(req.userId, req.body.user, function(err, chat) {
        if (!err)  res.send({"status": "success", "sidechat": chat});
        if (err) {
            var sideChat = new SideChat();
            sideChat.owner = req.userId;
            sideChat.user = req.body.user;
            sideChat.time = new Date();
            sideChat.save(function (err) {
                if(err) handleError(res, err);
                if (!err)  res.send({"status": "success", "sidechat": sideChat});
            })
        }
    })
});

function handleError(res, err){
    return res.send(500, err)
}

module.exports = router;
