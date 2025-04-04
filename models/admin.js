const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('../models/user');


const adminSchema = new Schema({
    ime: {
        type: String,
        required: true
    },
    prezime: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
})

/* adminSchema.plugin(passportLocalMongoose); */

module.exports = mongoose.model('Admin', adminSchema);