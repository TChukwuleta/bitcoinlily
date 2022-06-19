const mongoose = require('mongoose')
const schema = mongoose.Schema

const userSchema = new schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    iv: String,
    userid: String,
    pubkey: String,
    address: String
}, {
    timestamps: true
})

const User = mongoose.model('user', userSchema)
module.exports = User