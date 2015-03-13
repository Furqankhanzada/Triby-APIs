var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var cors = require('cors');
var _ = require('underscore');
var path = require('path');
var fs = require('fs-extra');
var easyimg = require('easyimage');

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

var s3 = require('s3');

var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: global.AWS_ACCESS_KEY,
    secretAccessKey: global.AWS_SECRET_KEY
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});

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


var multipart = require('connect-multiparty')
    , multipartMiddleware = multipart();

router.post('/uploads', multipartMiddleware, function(req, res){

    var data = _.pick(req.body, 'name', 'description')
        , uploadPath = global.MEDIA_FOLDER
        , file = req.files.file;
    
    var filename = file.path;
    easyimg.info(filename).then(function(fileInfo){
      console.log(fileInfo);
      var aType = req.body.type;
      var filename_thumb = "";
      var prename = "";
      var aWidth, aHeight;
      if(aType=="POST"){
        prename = "post-";
        aWidth = (fileInfo.width>600?600:fileInfo.width);
        aWidth = (fileInfo.width>600?(600 + (600*Math.abs(fileInfo.width-fileInfo.height)/fileInfo.height)):fileInfo.height);
      }
      else{
        prename = "thumb-";
        filename_thumb = uploadPath + "thumb-" + file.name;
        aWidth = 120;
        aHeight = 120;
      }
      console.log("converting picture: " + uploadPath + file.name);
      filename_thumb = uploadPath + prename + file.name;

      easyimg.thumbnail({
          src:filename, dst:filename_thumb,
          width:aWidth, height:aHeight
      }).then(
          function(image) {
              console.log('Resized and cropped picture: ' + image.width + ' x ' + image.height);
              var params = {
                localFile: filename_thumb,

                s3Params: {
                  Bucket: global.S3_BUCKET,
                  Key: prename + file.name,
                  ACL: 'public-read'
                }

              };
              var uploader = client.uploadFile(params);
              uploader.on('error', function(err) {
                console.error("unable to upload:", err.stack);
                res.send({"status":"error","url_file": url});
                return;
              });
              uploader.on('progress', function() {
                console.log("progress", uploader.progressMd5Amount,
                          uploader.progressAmount, uploader.progressTotal);
              });
              uploader.on('end', function() {
                console.log("done uploading");
                var url = s3.getPublicUrlHttp(global.S3_BUCKET,prename + file.name);
                res.send({"status":"success","url_file": url});
                return;
              });
              
          },
          function (err) {
              console.log("error resizing " + err)
          }
      );
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
