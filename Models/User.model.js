const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')


const UserSchema = new Schema({
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    }
})

UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10)
    const hashpassword = await bcrypt.hash(this.password, salt)
    this.password = hashpassword
    next()
})

UserSchema.methods.isValidPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model('user', UserSchema)
module.exports = User