const mongoose = require('mongoose')
const schema = mongoose.Schema

const transactionLogsSchema = new schema({
    txnId: String,
    amount: String,
    userId: Number,
    type: String,
    status: Number
})

const TransactionLogs = mongoose.model('transactionlog', transactionLogsSchema)
module.exports = TransactionLogs