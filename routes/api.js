var mongoose = require('mongoose');
var User = mongoose.model('User');
var express = require('express');
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var bCrypt = require('bcrypt-nodejs');

var router = express.Router();


function isAuthenticated(req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects

    //allow all get request methods
    if (req.method === "GET") {
        return next();
    }
    if (req.isAuthenticated()) {
        return next();
    }

    // if the user is not authenticated then redirect him to the login page
    return res.redirect('/#login');
};

// router.use('/users', isAuthenticated);


var createHash = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

//gets all users
router.route('/users')

.get(function(req, res) {
    User.find(function(err, user) {
        if (err) {
            return res.writeHead(500, err);
        }
        return res.send(user);
    });
});

module.exports = router;