var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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