const mongoose = require('mongoose')
const schema = mongoose.Schema

const userSchema = new schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    userid: String,
    address: String
})

const User = mongoose.model('user', userSchema)
module.exports = User