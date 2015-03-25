var express = require('express');
var router = express.Router();
var middleware = require('./../middleware');
var Event = require('./../models').Event;
var Biz = require('./../models').Biz;
var Post = require('./../models').Post;

router.post('/like', middleware.requiresUser, function(req, res) {
    var type = req.body.type;
    if(type == 'event'){
        Event.addToShakka( req , function(err, event) {
            res.send({"status":"success", "event":event});
        });
    }else if(type == 'biz'){
	    Biz.addToShakka( req , function(err, biz) {
            res.send({"status":"success", "biz":biz});
        });
    }else if(type == 'post'){
        Post.addToLike( req , function(err, post) {
            res.send({"status":"success", "post":post});
        });
    }else{
        res.send('Missing type parameter');
    }
});

router.put('/like', middleware.requiresUser, function(req, res) {
    var type = req.body.type;
    if(type == 'event'){
        Event.removeShakka( req , function(err, event) {
                res.send({"status":"success", "event":event});
        });
    }else if(type == 'biz'){
        Biz.removeShakka( req , function(err, biz) {
                res.send({"status":"success", "biz":biz});
        });
    }else if(type == 'post'){
        Post.removeLike( req , function(err, post) {
                res.send({"status":"success", "post":post});
        });
    }else{
        res.send('Missing type parameter');
    }
});

router.post('/dislike', middleware.requiresUser, function(req, res) {
    var type = req.body.type;
    if(type == 'event'){
        Event.addToShakka( req , function(err, event) {
            res.send({"status":"success", "event":event});
        });
    }else if(type == 'biz'){
        Biz.addToShakka( req , function(err, biz) {
            res.send({"status":"success", "biz":biz});
        });
    }else if(type == 'post'){
        Post.addToDislike( req , function(err, post) {
            res.send({"status":"success", "post":post});
        });
    }else{
        res.send('Missing type parameter');
    }
});

router.delete('/dislike', middleware.requiresUser, function(req, res) {
    var type = req.body.type;
    if(type == 'event'){
        Event.removeShakka( req , function(err, event) {
            res.send({"status":"success", "event":event});
        });
    }else if(type == 'biz'){
        Biz.removeShakka( req , function(err, biz) {
            res.send({"status":"success", "biz":biz});
        });
    }else if(type == 'post'){
        Post.removeDislike( req , function(err, post) {
            res.send({"status":"success", "post":post});
        });
    }else{
        res.send('Missing type parameter');
    }
});

router.post('/heart', middleware.requiresUser, function(req, res) {
    var type = req.body.type;
    if(type == 'event'){
        Event.addToHeart( req , function(err, event) {
            res.send({"status":"success", "event":event});
        });
    }else if(type == 'biz'){
        Biz.addToHeart( req , function(err, biz) {
            res.send({"status":"success", "biz":biz});
        });
    }else if(type == 'post'){
        Post.addToHeart( req , function(err, post) {
            res.send({"status":"success", "post":post});
        });
    }else{
        res.send('Missing type parameter');
    }
});

router.delete('/heart', middleware.requiresUser, function(req, res) {
    var type = req.body.type;
    if(type == 'event'){
        Event.removeHeart( req , function(err, event) {
            res.send({"status":"success", "event":event});
        });
    }else if(type == 'biz'){
        Biz.removeHeart( req , function(err, biz) {
            res.send({"status":"success", "biz":biz});
        });
    }else if(type == 'post'){
        Post.removeHeart( req , function(err, post) {
            res.send({"status":"success", "post":post});
        });
    }else{
        res.send('Missing type parameter');
    }
});

router.post('/comments', middleware.requiresUser, function(req, res) {
    var type = req.body.type;
    if(type == 'event'){
        Event.addComment( req , function(err, event) {
            res.send({"status":"success", "event":event});
        });
    }else if(type == 'biz'){
        Biz.addComment( req , function(err, biz) {
            res.send({"status":"success", "biz":biz});
        });
    }else if(type == 'post'){
        Post.addComment( req , function(err, post) {
            res.send({"status":"success", "post":post});
        });
    }else{
        res.send('Missing type parameter');
    }  
    
});

router.delete('/comments', middleware.requiresUser, function(req, res) {
    var type = req.body.type;
    if(type == 'event'){
        Event.removeComment( req , function(err, event) {
            res.send({"status":"success", "event":event});
        });
    }else if(type == 'biz'){
        Biz.removeComment( req , function(err, biz) {
            res.send({"status":"success", "biz":biz});
        });
    }else if(type == 'post'){
        console.log('post delete');
        Post.removeComment( req , function(err, post) {
            res.send({"status":"success", "post":post});
        });
    }else{
        res.send('Missing type parameter');
    }
    
});


module.exports = router;
