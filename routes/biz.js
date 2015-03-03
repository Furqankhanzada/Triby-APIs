var express = require('express');
var router = express.Router();
var middleware = require('./../middleware');
var Biz = require('./../models').Biz;
var Tribe = require('./../models').Tribe;

router.get('/tribes/:tribeid/biz', middleware.requiresUser, function(req, res) {
    Tribe.listBiz(req.param('tribeid') , function(err, bizs) {
        if(err || !bizs){
              var ret = middleware.handleDbError(err, bizs);
              res.send(ret);
            }
        Biz.findByIds(bizs , function(err, bizs) {
            res.send(bizs);		
        });
    });
});

router.post('/tribes/:tribeid/biz', middleware.requiresUser, function(req, res) {
    var biz = new Biz();
    biz.name = req.body.name;
    biz.description = req.body.description;
    biz.privacy = req.body.privacy;
    biz.createdby = req.user;
    biz.tribes = [req.param('tribeid')];
    biz.save(function () {
        req.bizid = biz._id;
        Tribe.addBiz( req , function(err, tribe) {
            if(err || !tribe){
              var ret = middleware.handleDbError(err, tribe);
              res.send(ret);
            }
            res.send(tribe);
        });
        
    });
});

router.get('/tribes/:tribeid/biz/:bizid', middleware.requiresUser, function(req, res) {
    Biz.findById(req.param('bizid') , function(err, biz) {
        res.send(biz);		
    });
});

router.put('/tribes/:tribeid/biz/:bizid', middleware.requiresUser, function(req, res) {
    Biz.update(req , function(err, biz) {
        res.send(biz);		
    });
});

module.exports = router;
