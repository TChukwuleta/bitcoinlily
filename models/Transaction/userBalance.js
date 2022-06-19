const mongoose = require('mongoose')
const schema = mongoose.Schema

const userBalance = new schema({
    userid: String,
    address: String,
    amount: Number
}, {
    timestamps: true
})

const Balance = mongoose.model('balance', userBalance)
module.exports = Balance 