var express = require('express');
var router = express.Router();

var User = require('./../models').User;
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var middleware = require('./../middleware');
var tools = require('../tools/twilio_sms');
var Token = require('./../models').Token;
var Feedback = require('./../models').Feedback;
var Device = require('./../models').Device;

// Get user
router.get('/user/:username', middleware.requiresUser, function(req, res) {
    User.findByUserName(req.params.username , function(err, user) {
        res.send({"status":"success", "user":user});  
    });
});

// Login user with username/mobilenumber/status=1
router.post('/user/login', function(req, res) {
  Device.findOne({"username":req.body.username,"mobilenumber":req.body.mobilenumber,"status":1},function(err,aDevice){

    if(err){
      res.json({"status":"error","message":err});
      return;
    }
    if(!aDevice)
      res.json({"status":"error","message":"Not logged"});
    else{
      User.findOne({"username":req.body.username,"mobilenumber":req.body.mobilenumber},function(err,aUser){
        if(!aUser)
          res.json({"status":"error","message":"User doesn't exists"});
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
  if(!req.body.device_id){
    res.json({"status":"error","message":"Not device id was generated for your device"});
    return;
  }

  User.findOne({"username":user.username,"mobilenumber":{ $ne : user.mobilenumber}},function(err,testUser){
    if(testUser){
      res.json({"status":"error","message":"Username already exists"});
      return;
    }
    User.findOne({"mobilenumber":user.mobilenumber, "username":{ $ne : user.username}},function(err,testUser){
      if(testUser){
        res.json({"status":"error","message":"Mobile number already exists"});
        return;
      }
      // if user and number already exists
      User.findOne({"mobilenumber":user.mobilenumber, "username":user.username},function(err,testUser){
        if(testUser){
          var code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
          Device.findOneAndUpdate({"username":user.username,"mobilenumber":user.mobilenumber},{"code":code,"status":0}, {upsert:false}, function(err){
            tools.sendSMS(user.mobilenumber,"Welcome to Triby!. Your code is " + code,function(response){
              res.json({"status":"success", "user":testUser}); 
              return; 
            }); 
          });
        }
        else{
          user.email = req.body.email;
          user.hashed_password = bcrypt.hashSync(req.body.password, salt);
          user.salt = salt;
          user.firstname = req.body.firstname;
          user.lastname = req.body.lastname;
          user.city = req.body.city;
          user.country = req.body.country;

          var device = new Device();
          device.username = user.username;
          device.mobilenumber = user.mobilenumber;
          device.device_id = req.body.device_id;
          device.code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

          user.save(function (err) {
            if(err){
              res.send({"error":err});
              return;
            }
            else
              device.save(function(err){
                if(err)
                  console.log(err);
                usr = user.toObject();
                delete usr.__v;
                delete usr.hashed_password;
                delete usr.salt;
                tools.sendSMS(user.mobilenumber,"Welcome to Triby!. Your code is " + device.code,function(response){
                  if(response.status == "error"){
                    User.remove({"mobilenumber":user.mobilenumber},function(err){
                      res.json({"status":"error","message":response.message});
                      return;
                    });
                  }
                  else
                    res.send({"status":"success", "user":usr}); 
                });
              });
          });
        }
      });
    });
  });

});

//User profile update
router.put('/user/:username', middleware.requiresUser, function(req, res) {
  User.findOne({"username":req.params.username},function(err,aUser){
    aUser.name = req.body.name;
    aUser.pic = req.body.image;
    aUser.city = req.body.city;
    console.log(aUser);
    aUser.save(function(err,user2){
      console.log(user2);
      if(err){
        res.json({"status":"error","message":err});
        return;
      }
      res.json({"status":"success"});
    });
  });
});

// Create or update Facebook user
router.post('/user/facebook', function(req, res) {
  var username = req.body.id;

  User.findOne({"username":username},function(err,aUser){
    console.log(aUser);
    if(!aUser){ //update
      aUser = new User();
      aUser.username = req.body.id;
      aUser.mobilenumber = "";
      aUser.type = "FACEBOOK";
      aUser.status = 1;
    }
    aUser.name = req.body.name;
    aUser.email = req.body.email;
    aUser.pic = req.body.image;

    aUser.save(function(err){
      if(err){
        res.json({"status":"error","message":err});
        return;
      }
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
    /*
    User.findOneAndUpdate({"username":aUser.username},aUser,{upsert:true},function(err,numberAffected){
      if(err){
        res.json({"status":"error","message":err});
        return;
      }
      else{
        res.json({"status":"success","message":"Facebook user created successfully"});
      }
    });*/
  })
});

//User code confirm
router.post('/user/confirm', function(req, res) {
  var code = req.body.code;
  var phone_number = req.body.mobilenumber;
  var username = req.body.username;
  
  Device.findOne({"username":username,"mobilenumber":phone_number,"code":code},function(err,aDevice){
    if(!aDevice){
      res.json({"status":"error","message":"Invalid code"});
      return;
    }
    aDevice.status = 1;
    aDevice.save(function(err,device2){
      if(err){
        res.json({"status":"error","message":err});
        return;
      }
      User.findOneAndUpdate({"username":username},{"status":1},function(err){
        if(err) {
          res.json({"status":"error","message":err});
          return;
        }
        res.json({"status":"success"});
      });
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

// Get users from mobile number list
router.post('/user/contacts', middleware.requiresUser, function(req, res) {

  var contacts = req.body.contacts;

  User.find({"mobilenumber": {$in: contacts},"status":1}, function(err,users){
    if(err)
      res.send({"status":"error","message":err});
    else
      res.json({"status":"success","users":users});
  });
});

// Get users from mobile number list
router.post('/user/facebook/contacts', middleware.requiresUser, function(req, res) {

  var contacts = req.body.contacts;

  User.find({"username": {$in: contacts},"status":1}, function(err,users){
    if(err)
      res.send({"status":"error","message":err});
    else
      res.json({"status":"success","users":users});
  });
});

module.exports = router;
