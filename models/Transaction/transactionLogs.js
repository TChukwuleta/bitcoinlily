const mongoose = require('mongoose')
const schema = mongoose.Schema

const transactionLogsSchema = new schema({
    txnId: String,
    amount: String,
    userId: String,
    receiver: String,
    sender: String,
    transactionType: String,
    fee: Number,
    type: String,
    status: Number
}, {
    timestamps: true
})

const TransactionLogs = mongoose.model('transactionlog', transactionLogsSchema)
module.exports = TransactionLogs