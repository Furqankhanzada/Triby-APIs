var express = require('express');
var router = express.Router();
var middleware = require('./../middleware');
var Post = require('./../models').Post;
var Tribe = require('./../models').Tribe;
var Biz = require('./../models').Biz;

router.post('/posts', middleware.requiresUser, function(req, res) {
    var type = req.body.parenttype;
    var post = new Post();
    post.createdby = req.user;
    post.date = new Date();
    post.content = req.body.content;
    post.parentType = req.body.parenttype;
    post.parentID = req.body.parentid;
    post.save(function () {
    req.postid = post._id;
        
	if(type == 'event'){
          Event.addPost( req , function(err, event) {
              res.send({"status":"success", "event":event});
          });
	}else if(type == 'biz'){
	       Biz.addPost( req , function(err, biz) {
              res.send({"status":"success", "biz":biz});
          });
	}else if(type == 'tribe'){
	       Tribe.addPost( req , function(err, tribe) {
              res.send({"status":"success", "tribe":tribe});
          });
	}

    });    
});


router.put('/posts/:postid', middleware.requiresUser, function(req, res) {
    Post.update(req , function(err, post) {
        res.send({"status":"success", "post":post});		
    });
});

router.delete('/posts/:postid', middleware.requiresUser, function(req, res) {
    Post.removeById(req.param('postid') , function(err, pres) {
        res.send(pres);		
    });
});

router.get('/posts/:postid', middleware.requiresUser, function(req, res) {
    Post.findById(req.param('postid') , function(err, post) {
        res.send({"status":"success", "post":post});		
    });
});

router.put('/posts', middleware.requiresUser, function(req, res) {
    Post.findByIds(req.body.ids , function(err, posts) {
        res.send({"status":"success", "posts":posts});		
    });
});

router.get('/posts', middleware.requiresUser, function(req, res) {
    Post.findByParent(req , function(err, posts) {
        res.send({"status":"success", "posts":posts});		
    });
});

router.put('/getallposts', middleware.requiresUser, function(req, res) {
    Post.findByParents(req , function(err, posts) {
        res.send({"status":"success", "posts":posts});		
    });
});
    
module.exports = router;
