var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var cors = require('cors');

var User = require('./../models').User;
var Token = require('./../models').Token;
var Tribe = require('./../models').Tribe;
var Event = require('./../models').Event;
var Biz = require('./../models').Biz;
var Ipeople = require('./../models').Ipeople;
var Post = require('./../models').Post;
var Picture = require('./../models').Picture;

var middleware = require('./../middleware');
var multiparty = require('multiparty');
var fs = require('fs');

/* GET home page. */
router.get('/', middleware.requiresUser, function(req, res) {
    res.send('OK');  
});

router.post('/login', function(req, res) {
  User.authenticate( req.body , function(err, user) {
	if (err || !user) res.status(403).send("Forbidden");
	res.send(user);
  });

});

router.post('/ipeople', function(req, res) {
    console.log('ippl test');
    var ipeople = new Ipeople();
    ipeople.email = req.query.email;
    ipeople.firstname = req.query.fname;
    ipeople.lastname = req.query.lname;
    ipeople.regdate = new Date();
    ipeople.save(function () {
    	//res.header("Access-Control-Allow-Origin", "*");
  	//res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.send({'status':'success'});                
    });    
});

router.get('/ipeople', function(req, res) {
    Ipeople.list( req , function(err, ipeoples) {
        res.send(ipeoples);
    });
});




router.post('/photo', function(req, res) {
    console.log('photo');
    var form = new multiparty.Form();
    var picture = new Picture();
    var type = req.query.parenttype;
    
    form.parse(req, function(err, fields, files) {
        
        for (var i = 0, len = files.files.length; i < len; i++) {
        
            var path = files.files[i].path;
            var n = path.lastIndexOf("/") + 1;

            var tempName = path.substring(n);
            var originalName = files.files[i].originalFilename;
            var filePath = '/var/www/html/nodeJS/weC/uploads/' + tempName;

            picture.filename = originalName;
            picture.filelocation = filePath;
            picture.parentid = req.query.parentid;
            picture.parenttype = req.query.parenttype;
            picture.save(function () {
              req.pictureid = picture._id;
              console.log(picture._id);
                if(type == 'event'){
                      Event.setPic( req , function(err, event) {
                          res.send(event);
                      });
                }else if(type == 'biz'){
                      Biz.setPic( req , function(err, biz) {
                              res.send(biz);
                      });
                }else if(type == 'tribe'){
                      Tribe.setPic( req , function(err, tribe) {
                              res.send(tribe);
                      });
                }else if(type == 'profile'){
                      User.setPic( req , function(err, user) {
                              res.send(user);
                      });
                }

            });            

	       console.log(path);
            var tfile = fs.readFileSync(path);
            fs.writeFile(filePath,tfile);
          
        }
        
    });
    
});

router.post('/profilephoto', function(req, res) {
    res.send('profilephoto');
});

router.post('/newposts', function(req, res) {
    res.send('newposts');
});

router.post('/notifications', function(req, res) {
    res.send('notifications');
});

router.post('/lastseen', function(req, res) {
   res.send('lastseen'); 
});


module.exports = router;
