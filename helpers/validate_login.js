const Joi = require('@hapi/joi')


const authSchema = Joi.object({
    email : Joi.string().email().required(),
    password : Joi.string().required(),
})

module.exports = {
    authSchema,
}