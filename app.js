var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var cors = require('cors');

var mongoose = require('mongoose');
mongoose.connect('mongodb://arjunw7:13bcb0062@ds017155.mlab.com:17155/sasitravels');
require('./models/models');

var api = require('./routes/api');
var authenticate = require('./routes/authenticate')(passport);
var app = express();

app.use(logger('dev'));
app.use(session({
    secret: 'ssshhhhh',
    saveUninitialized: true,
    resave: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api);
app.use('/auth', authenticate);

//Initialiaze passport
var initPassport = require('./passport-init');
initPassport(passport);
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
        res.status(err.status || 500)
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
});


module.exports = app;