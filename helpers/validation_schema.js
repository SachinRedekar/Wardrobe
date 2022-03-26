const Joi = require('@hapi/joi')

 const schema = Joi.object({
     username : Joi.string().required(),
     email : Joi.string().email().lowercase().required(),
     password : Joi.string().min(2).required(),
 })

 module.exports = {
    schema,
 }