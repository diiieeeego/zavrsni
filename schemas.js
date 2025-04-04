const Joi = require('joi');

module.exports.kolegijSchema = Joi.object({
    kolegij: Joi.object({
        naziv: Joi.string().required(),
        nositelj: Joi.string().required()
    }).required()
})

module.exports.studentSchema = Joi.object({
    student: Joi.object({
        ime: Joi.string().required(),
        prezime: Joi.string().required(),
        email: Joi.string().required(),
        status: Joi.string().required(),
        dob: Joi.number().required()
    }).required()
})
module.exports.adminSchema = Joi.object({
    student: Joi.object({
        ime: Joi.string().required(),
        prezime: Joi.string().required(),
        email: Joi.string().required(),
             
    }).required()
})