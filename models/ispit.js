const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ispitSchema = new Schema({
    naslov: String,
    datum: String,
    kolegij: {
        type: Schema.Types.ObjectId,
        ref: 'Kolegij'
    },
    
    rezultati: [{
        student: {
          type: Schema.Types.ObjectId,
          ref: 'Student'
        },
        ocjena: {
          type: Number
        }
      }]
    
})

module.exports = mongoose.model('Ispit', ispitSchema);