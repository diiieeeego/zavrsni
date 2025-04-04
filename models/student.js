const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Kolegij = require('./kolegij');
const passportLocalMongoose = require('passport-local-mongoose');

const StudentSchema = new Schema({
    ime: String,
    prezime: String,
    email: {
        type: String,
        required:true,
        unique:true
    },
    dob: Number,
    status: String,
    kolegiji: [{
        type: mongoose.Schema.ObjectId,
        ref:'Kolegij'
    }]

});
/* StudentSchema.plugin(passportLocalMongoose); */

module.exports = mongoose.model('Student', StudentSchema);