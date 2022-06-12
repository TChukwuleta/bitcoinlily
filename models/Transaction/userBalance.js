const mongoose = require('mongoose')
const schema = mongoose.Schema

const userBalance = new schema({
    userid: String,
    address: String,
    amount: Number
})

const Balance = mongoose.model('balance', userBalance)
module.exports = Balance