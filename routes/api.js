var mongoose = require('mongoose');   
var User = mongoose.model('User');   
var Booking = mongoose.model('Booking');
var express = require('express');
var passport = require('passport'); 
var async = require('async');
var crypto = require('crypto');
var bCrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var msg91 = require("msg91")("116142AQGxO25kEXN57658c70", "SASITR", 4 );  
var Insta = require('instamojo-nodejs');
Insta.setKeys('9658583007a01b23f0ba90c1003641b8', '4f5ff239ed5615148912ce699dfaefc6'); 
var router = express.Router();


function isAuthenticated (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects

    //allow all get request methods
    if(req.method === "GET"){
        return next();
    }
    if (req.isAuthenticated()){
        return next();
    }

    // if the user is not authenticated then redirect him to the login page
    return res.redirect('/#login');
};

// router.use('/users', isAuthenticated);


var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

router.route('/users')
    //gets all users
    .get(function(req, res){
        User.find(function(err, user){
            if(err){
                return res.writeHead(500, err);
            }
            return res.send(user);
        });
    });

router.route('/confirmOTP')
    .post(function(req, res){
        var mobileNo = req.body.customerContact;
        var otp = req.body.otp;
              msg91.send(mobileNo, 'Your OTP for taxi booking confirmation is' + message + '\nRegards\nSasi Travels', function(err, response){
                console.log(err);
                console.log(response);
              });
        return res.send('done'); 
    });

router.route('/contact')
    .post(function(req, res){
         var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                  user: 'arjunw7@gmail.com',
                  pass: '9943130589'
                }
              });
              var mailOptions = {
                to: 'arjunw7@gmail.com',
                from: req.body.email,
                subject: 'Website contact form',
                text: 'Website contact form,\n\n' +
                    'Name: ' + ' ' + req.body.name +
                    '\nEmail: ' + ' ' + req.body.email +
                    '\nContact Number: ' + ' ' + req.body.number +
                    '\nMessage: ' + ' ' + req.body.message
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                console.log('Mail Sent');
              });
    });

router.route('/booking')

    //gets the menu
    .get(function(req, res){
        Booking.find(function(err, booking){
            if(err){
                return res.writeHead(500, err);
            }
            return res.send(booking);
        });
    })
   
     //adds a new item to menu
    .post(function(req, res){
        var newBooking = new Booking();
        newBooking.bookingType = req.body.bookingType;
        newBooking.journeyType = req.body.journeyType;
        newBooking.pickupLocation = req.body.pickupLocation;
        newBooking.dropLocation = req.body.dropLocation;
        newBooking.departDate = req.body.departDate;
        newBooking.returnDate = req.body.returnDate;
        newBooking.departTime = req.body.departTime;
        newBooking.returnTime = req.body.returnTime;
        newBooking.passengers = req.body.passengers;
        newBooking.carType = req.body.carType;
        newBooking.customerName = req.body.customerName;
        newBooking.customerEmail = req.body.customerEmail;
        newBooking.customerContact = req.body.customerContact;
        newBooking.customerAddress = req.body.customerAddress;
        newBooking.userId = req.body.userId;
        newBooking.otp = req.body.otp;
        newBooking.save(function(err, newBooking) {
            if (err){
                return res.send(500, err);
            }
            var mobileNo = req.body.customerContact;
            var otp = req.body.otp;
                  msg91.send(mobileNo, 'Your OTP for taxi booking confirmation is ' + otp + '\n\nRegards\nSasi Travels', function(err, response){
                    console.log(err);
                    console.log(response);
                  });
            return res.send(JSON.stringify(newBooking));
        });
    })

    .delete(function(req, res){
        Booking.remove({}, function(err) {
            if (err)
                res.send(err);
            res.json("deleted");
        });
    });

router.route('/paymentRequest')
        .post(function (req, res){
            var data = new Insta.PaymentData();
            data.purpose = "Sasi Travels";
            data.amount = 1000; 
            data.buyer_name = req.body.customerName;
            data.email = req.body.costomerEmail;
            data.phone = req.body.customerContact;
            data.allow_repeated_payments = 'False';
            data.redirect_url = 'http://www.sasitravels.in/#/success';
            Insta.createPayment(data, function(error, response) {
              if (error) {
                console.log()
              } else {
                // Payment redirection link at response.payment_request.longurl

                console.log(response);
                res.send(response);
              }
            });
        });

router.route('/savePayment')
        .post(function (req, res){
              var payment_id = req.body.payment_id;
              var payment_request_id = req.body.payment_request_id;
              Booking.findOne({ _id: req.body.booking_id }, function(err, booking) {
                if (!booking) {
                  return res.send('Booking not found');
                }

                booking.status = 'paid';
                var mobileNo = req.body.customerContact;
                  msg91.send(mobileNo, 'Your taxi booking (' + req.body.booking_id + ') has been confirmed. Kindlu contact MD Asil(9042099195/9894599145) for futhur details.\n\nRegards\nSasi Travels', function(err, response){
                    console.log(err);
                    console.log(response);
                  });
                booking.payment_request_id = req.body.payment_request_id;
                booking.payment_id = req.body.payment_id; 

                booking.save(function(err) {
                  console.log(booking);
                  
                });
              });
        });

router.route('/users/:id')
    
    //deletes a user
    .delete(function(req, res){
        User.remove({
            _id: req.params.id
        }, function(err) {
            if (err)
                res.send(err);
            res.json("Use deleted");
        });
    });

module.exports = router;
