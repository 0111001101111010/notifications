var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var config = require('config.json')('./nodemon.json');

/**Adding in Mirror utils **/
var mirror = require('mirror-utils');
//console.log(config);
var authUtils = new mirror.Auth();
var cardUtils = new mirror.Card();
var contactUtils = new mirror.Contacts();
var menuUtils = new mirror.Menu();

console.log(process.env);
console.log(config);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes);
app.use('/users', users);

app.use('/install', authUtils.install);
app.use('/oauth2callback', function(req, res){
    // if we're able to grab the token, redirect the user back to the main page
    authUtils.getToken(req.query.code, function(data) {
        console.log('failure',data);
        res.end();
    }, function(oauth2Client, client) {
        console.log('success',oauth2Client, client);
        var timelineUtils = new mirror.Timeline(oauth2Client, client);
        var menu = menuUtils.buildSimpleDefault().build();
        var card = cardUtils.reset().id(123).title("test").text("hello").menus(menu).build();
        console.log('try to insert card',card);
        timelineUtils.insertCard(card, failure, success);
        res.end();
    });
});

function failure(){
console.log(arguments);
}

function success(){
  console.log(arguments);
}

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

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

//app.set('port', process.env.PORT || 4000);
app.listen(8081);
console.log("now listening on port: " + 4000);

module.exports = app;
