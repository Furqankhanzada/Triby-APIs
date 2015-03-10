var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var fs = require('fs');

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

app.all('*', function(req, res, next) {
  console.log('ALL');
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Content-Type, Accept");
  next();
 });

app.use('/', routes);
app.use('/', users);
app.use('/', tribes);
app.use('/', events);
app.use('/', biz);
app.use('/', posts);
app.use('/', social);

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
