var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var fs = require('fs');
var _ = require('underscore');
var uuid = require('node-uuid');
var easyimg = require('easyimage');


var s3 = require('s3');
var configuration = JSON.parse(
  fs.readFileSync("configuration.json")
);

// twilio settings
global.TWILIO_SID = configuration.TWILIO_SID;
global.TWILIO_TOKEN = configuration.TWILIO_TOKEN;
global.TWILIO_NUMBER = configuration.TWILIO_NUMBER;

// media settings
global.MEDIA_FOLDER = configuration.MEDIA_FOLDER;

// Amazon settings
global.AWS_ACCESS_KEY = configuration.AWS_ACCESS_KEY;
global.AWS_SECRET_KEY = configuration.AWS_SECRET_KEY;
global.S3_BUCKET = configuration.S3_BUCKET;

var routes = require('./routes/index');
var users = require('./routes/users');
var tribes = require('./routes/tribes');
var events = require('./routes/events');
var biz = require('./routes/biz');
var posts = require('./routes/posts');
var social = require('./routes/social');
var sidechat = require('./routes/sidechat');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var multipart = require('connect-multiparty')
    , multipartMiddleware = multipart();

app.use(multipartMiddleware,function(req, res, next) {
  console.log('ALL');
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Content-Type, Accept");
  if(req.body.image_type) fileHandler(req, res, next);
  else next();
 });

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
    }
});


function fileHandler(req, res, next){
        if(req.method === 'POST' && req.headers && req.headers["content-type"] && req.headers["content-type"].indexOf("multipart/form-data") >= 0 &&
            req.files.file){
            var data = _.pick(req.body, 'name', 'description')
                , uploadPath = global.MEDIA_FOLDER
                , file = req.files.file;

            var filename = file.path;
            easyimg.info(filename).then(function(fileInfo){
                var aType = req.body.image_type;
                var filename_thumb = "";
                var prename = "";
                var aWidth, aHeight;
                if(aType=="POST"){
                    prename = "post-";
                    aWidth = fileInfo.width;
                    aHeight = fileInfo.height;
                }
                else{
                    prename = "thumb-";
                    filename_thumb = uploadPath + "thumb-" + file.name;
                    if(fileInfo.width > fileInfo.height){
                        aWidth = fileInfo.height;
                        aHeight = fileInfo.height;
                    }
                    else
                    {
                        aWidth = fileInfo.width;
                        aHeight = fileInfo.width;
                    }

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
                        });
                        uploader.on('progress', function() {
                            console.log("progress", uploader.progressMd5Amount,
                                uploader.progressAmount, uploader.progressTotal);
                        });
                        uploader.on('end', function() {
                            console.log("done uploading");
                            req.url_file = s3.getPublicUrlHttp(global.S3_BUCKET,prename + file.name);
                            next();
                        });

                    },
                    function (err) {
                        console.log("error resizing " + err);
                        next();
                    }
                );
            }, function(err){
                console.log("error resizing " + err);
                next();
            });
        }
        else{
            next();
        }
}

app.use('/', routes);
app.use('/', users);
app.use('/', tribes);
app.use('/', events);
app.use('/', biz);
app.use('/', posts);
app.use('/', social);
app.use('/', sidechat);

//app.use(cors());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

console.log("Express server listening on port %d", app.get('port'))
