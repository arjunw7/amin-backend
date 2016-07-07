var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bookingSchema = new mongoose.Schema({
    bookingType: String,
    journeyType: String,
    pickupLocation: String,
    dropLocation: String,
    departDate: String,
    returnDate: String,
    departTime: String,
    returnTime: String,
    passengers: String,
    carType: String,
    customerName: String,
    customerEmail: String,
    customerContact: String,
    customerAddress: String,
    userId: String,
    otp: String
});

var userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    contact: Number,
    username: String,
    password: String, //hash created from password
    token: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

mongoose.model('User', userSchema);
mongoose.model('Booking', bookingSchema);
