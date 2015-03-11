var express = require('express');
var router = express.Router();
var middleware = require('./../middleware');
var Tribe = require('./../models').Tribe;
var User = require('./../models').User;

router.get('/tribes/user/:username', middleware.requiresUser, function(req, res) {
    
    Tribe.listByUser(req.params.username , function(err, tribes) {
	   res.send({"status":"success", "tribes":tribes});	
    });
});

router.post('/tribes', middleware.requiresUser, function(req, res) {
    var tribe = new Tribe();
    tribe.name = req.body.name;
    tribe.description = req.body.description;
    tribe.privacy = req.body.privacy;
    tribe.createdby = req.body.username;
    tribe.pic = req.body.pic;
    for(var i=0; i < req.body.members.length; i++)
        tribe.members.push(req.body.members[i]);
    tribe.save(function () {
        trb = tribe.toObject();
	    delete trb.__v;
        res.send({"status":"success", "tribe":trb});
    });
});

router.put('/tribes/:tribeid', middleware.requiresUser, function(req, res) {
    Tribe.findById(req.params.tribeid,function(err,aTribe){
        if(err){
            res.send({"status":"error", "message":err});
            return;
        }
        if(!aTribe){
            res.send({"status":"error", "message":"Tribe not found"});
            return;
        }
        if(req.body.name)
            aTribe.name = req.body.name;
        if(req.body.pic)
            aTribe.pic = req.body.pic;
        if(req.body.members){
            aTribe.members = [];
            for(var i=0; i < req.body.members.length; i++)
                aTribe.members.push(req.body.members[i]);
        }
        Tribe.findOneAndUpdate({"_id":req.params.tribeid},aTribe,
            function (err, tribe) {
                if(err){
                  res.send({"status":"error","message":err});
                  return;
                }
                res.json({"status":"success","tribe":tribe});
        });
    });   
});

router.get('/tribes/:tribeid', middleware.requiresUser, function(req, res) {
  Tribe.findById(req.param('tribeid') , function(err, tribe) {
	res.send({"status":"success", "tribe":tribe});		
  });
});

router.post('/tribes/:tribeid/members', middleware.requiresUser, function(req, res) {

    req.body.users.forEach(function(user) { 
        
        User.findByUserName( user.username , function(err, usr) {
            console.log(usr.status);
            if(usr.status=="empty result" || usr.status=="error") {
                var newuser = new User();
                newuser.email = user.email;
                newuser.firstname = user.firstname;
                newuser.lastname = user.lastname;
                newuser.save(function () {
                    
                });
                usr = newuser;
            }
            req.username = usr.username;
            Tribe.addMember( req , function(err, tribe) {
                
            });
        });
    })
    res.send({"status":"success"});
});

router.delete('/tribes/:tribeid/members', middleware.requiresUser, function(req, res) {
        Tribe.removeMember( req , function(err, tribe) {
                res.send({"status":"success", "tribe":tribe});
        });
});

module.exports = router;
