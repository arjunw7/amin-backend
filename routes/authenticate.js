var mongoose = require('mongoose');
var User = mongoose.model('User');
var express = require('express');
var async = require('async');
var crypto = require('crypto');
var bCrypt = require('bcrypt-nodejs');
var router = express.Router();

module.exports = function(passport) {

    //sends successful login state back to the angulr
    router.get('/success', function(req, res) {
        res.send({ state: 'success', user: req.user ? req.user : null });
    });

    //sends failure login state back to angular
    router.get('/failure', function(req, res) {
        res.send({ state: 'failure', user: null, message: "invalid username or password" });
    });

    //log in
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    //sign up
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    //log out
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    //route to retain user details on client side
    router.get('/confirm-login', function(req, res) {
        res.send(req.user)
    });

    // route to test if the user is logged in or not
    router.get('/isAuthenticated', function(req, res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    });
    return router;
}