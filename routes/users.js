var express = require('express');
var router = express.Router();

var User = require('./../models').User;
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var middleware = require('./../middleware');
var tools = require('../tools/twilio_sms');
var Token = require('./../models').Token;
var Feedback = require('./../models').Feedback;


// Get user
router.get('/user/:username', middleware.requiresUser, function(req, res) {
    console.log(req.params.username);
    User.findByUserName(req.params.username , function(err, user) {
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
    else{
      // creating a new token
      var token = new Token();
      token.token = uuid.v4();
      token.username = aUser.username;
      token.save(function () { 
        res.json({"status":"success","user":aUser,"token":token.token});
      });
    }

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
router.put('/user/:username', middleware.requiresUser, function(req, res) {
  User.findOne({"username":req.params.username},function(err,aUser){
    aUser.name = req.body.name;
    aUser.pic = req.body.image;
    aUser.city = req.body.city;

    aUser.save(function(err,user2){
      if(err){
        res.json({"status":"error","message":err});
        return;
      }
      res.json({"status":"success"});
    });
  });
});

//User create
router.post('/user/confirm', function(req, res) {
  var code = req.body.code;
  var phone_number = req.body.mobilenumber;
  var username = req.body.username;
  
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
      res.json({"status":"success"});
    });
  });

});

// Change user phone number
router.post('/user/changenumber', middleware.requiresUser, function(req, res) {
 
  var old_number = req.body.old_number;
  if(old_number) // remove blank spaces
    old_number = old_number.replace(" ","");

  var new_number = req.body.new_number;
  if(new_number) // remove blank spaces
    new_number = new_number.replace(" ","");

  User.findOne({"mobilenumber":old_number},function(err,aUser){
    if(err){
      res.json({"status":"error","message":err});
      return;
    }
    if(!aUser){
      res.json({"status":"error","message":"Enter your current mobile number"});
      return;
    }
    aUser.mobilenumber = new_number;
    aUser.save(function(err,aUser2){
      res.json({"status":"success","message":"Phone number was successfully changed","user":aUser2});
    });
  });  
          
});

// Delete user account
router.post('/user/delete', middleware.requiresUser, function(req, res) {
 
  var old_number = req.body.old_number;
  if(old_number) // remove blank spaces
    old_number = old_number.replace(" ","");

  User.findOne({"mobilenumber":old_number},function(err,aUser){
    if(err){
      res.json({"status":"error","message":err});
      return;
    }
    if(!aUser){
      res.json({"status":"error","message":"Enter your current mobile number"});
      return;
    }
    User.remove({"username":aUser.username},function(err,aUser2){
      res.json({"status":"success","message":"User was successfully removed"});
    });
  });  
          
});

//Feedback create
router.post('/user/feedback', middleware.requiresUser, function(req, res) {

  Feedback.create(req.body,function (err,feedback) {
    if(err)
      res.send({"status":"error","message":err});
    else
      res.json({"status":"success","feedback":feedback});
  });
    
});

module.exports = router;
