var mongoose = require('mongoose');   
var User = mongoose.model('User');
var express = require('express');
var async = require('async');
var crypto = require('crypto');
var bCrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var msg91 = require("msg91")("116142AQGxO25kEXN57658c70", "SASITR", 4 );  
var router = express.Router();

module.exports = function(passport){

    //sends successful login state back to the angulr
    router.get('/success', function (req, res){
        res.send({state: 'success', user:req.user ? req.user : null});
    });

    //sends failure login state back to angular
    router.get('/failure', function (req, res){
        res.send({ state: 'failure', user:null, message: "invalid username or password"});
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

    router.route('/forgot')
        .post(function(req, res, next) {
          async.waterfall([
            function(done) {
              crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
              });
            },
            function(token, done) {
              User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                  return res.redirect('/forgotPassword');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                  done(err, token, user);
                });
              });
            },
            function(token, user, done) {
              var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                  user: 'arjunw7@gmail.com',
                  pass: '9943130589'
                }
              });
              var mailOptions = {
                to: user.email,
                from: 'Sasi Travels',
                subject: 'Password change request',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '#/reset/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                done(err, 'done');
                console.log("Mail sent")
              });
            }
          ], function(err) {
            if (err) return next(err);
          });
        });

    router.route('/reset/:token')
        .get(function(req, res) {
          User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
             console.log('Password reset token is invalid or has expired.');
              return res.redirect('/forgot');
            }
            res.redirect('/reset')
          });
        })

        .post(function(req, res) {
          async.waterfall([
            function(done) {
              User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                  console.log('Password reset token is invalid or has expired.');
                  return res.redirect('back');
                }
                console.log(user.username);
                user.password = createHash(req.body.password);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                  req.logIn(user, function(err) {
                    done(err, user);
                  });
                });
              });
            },
            function(user, done) {
              var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                  user: 'arjunw7@gmail.com',
                  pass: '9943130589'
                }
              });
              var mailOptions = {
                to: user.email,
                from: 'Food Mall VITU',
                subject: 'Password reset successful',
                text: 'Hello,\n\n' +
                  'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                console.log('Success! Your password has been changed.');
                done(err);
              });
              var mobileNo = user.contact;
              msg91.send(mobileNo, "Dear Customer, your Sasi Travels password has been changed successfully.", function(err, response){
                console.log(err);
                console.log(response);
              });
            }
          ], function(err) {
            res.redirect('/');
          });
    });
    

    router.get('/facebook', passport.authenticate('facebook', { scope: 'email'}));

    router.get('/facebook/callback',
      passport.authenticate('facebook', { successRedirect: '/#home',
                                          failureRedirect: '/login'       }));

        return router;
    }   
