var express = require('express');
var router = express.Router();

var User = require('./../models').User;
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var middleware = require('./../middleware');
var tools = require('../tools/twilio_sms');

/* GET users listing. */
router.get('/test', function(req, res) {
  res.send('respond with a resource');
});

router.get('/user', middleware.requiresUser, function(req, res) {
    console.log(req.user);
    User.findByEmail( req.user , function(err, user) {
        res.send({"status":"success", "user":user});  
    });
});

router.put('/user', middleware.requiresUser, function(req, res) {
    User.update( req , function(err, user) {
        res.send({"status":"success", "user":user});
    });  
});

// Login user with username/mobilenumber/status=1
router.post('/user/login', function(req, res) {
  User.findOne({"username":req.body.username,"mobilenumber":req.body.mobilenumber,"status":1},function(err,aUser){
    if(err){
      res.json({"status":"error","message":err});
      return;
    }
    if(!aUser)
      res.json({"status":"error","message":"Not logged"});
    else
      res.json({"status":"success","user":aUser});
  });
});

//User create
router.post('/user', function(req, res) {
   
  var salt = bcrypt.genSaltSync(10);
  var user = new User();

  user.username = req.body.username; // required 
  user.mobilenumber = req.body.mobilenumber; // required
  if(!user.username || !user.mobilenumber){
    res.json({"status":"error","message":"Username and mobile number are required"});
    return;
  }
  User.findOne({"username":user.username},function(err,testUser){
    if(testUser){
      res.json({"status":"error","message":"Username already exists"});
      return;
    }
    User.findOne({"mobilenumber":user.mobilenumber},function(err,testUser){
      if(testUser){
        res.json({"status":"error","message":"Mobile number already exists"});
        return;
      }

      user.email = req.body.email;
      user.hashed_password = bcrypt.hashSync(req.body.password, salt);
      user.salt = salt;
      user.firstname = req.body.firstname;
      user.lastname = req.body.lastname;
      user.city = req.body.city;
      user.country = req.body.country;
      user.code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

      user.save(function (err) {
        if(err)
          res.send({"error":err});
        else
        {
          usr = user.toObject();
          delete usr.__v;
          delete usr.hashed_password;
          delete usr.salt;
          tools.sendSMS(user.mobilenumber,"Welcome to Triby!. Your code is " + user.code,function(response){
            if(response.status == "error"){
              User.remove({"mobilenumber":user.mobilenumber},function(err){
                res.json({"status":"error","message":response.message});
                return;
              });
            }
            else
              res.send({"status":"success", "user":usr}); 
          });
        }
      });
    });
  });

});

//User create
router.post('/user/confirm', function(req, res) {
  var code = req.body.code;
  var phone_number = req.body.mobilenumber;
  var username = req.body.username;
  console.log(req.body);
  User.findOne({"username":username,"mobilenumber":phone_number,"code":code},function(err,aUser){
    if(!aUser){
      res.json({"status":"error","message":"Invalid code"});
      return;
    }
    aUser.status = 1;
    aUser.save(function(err,user2){
      if(err){
        res.json({"status":"error","message":err});
        return;
      }
      res.json({"status":"sucess"});
    });
  });

});

module.exports = router;
