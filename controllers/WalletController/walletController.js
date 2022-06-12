require('dotenv').config()
const validateSchema = require('../../utils/validations/validateSchema')
const axios = require('axios')
const User = require('../../models/User/userModel')
const Balance = require('../../models/Transaction/userBalance')
const Transaction = require('../../models/Transaction/transactionLogs')
const { errorResMsg, successResMsg } = require('../../utils/libs/response')
const { createTransaction } = require('../../bitcoin/btcFunctions')

const baseFee = process.env.BaseFee ? process.env.BaseFee : 0.00000200
const feeRateUrl = 'https://mempool.space/signet/api/v1/fees/recommended'

// Transaction schema
const transactionSchema = Joi.object({
    RecipientAddress: Joi.string().required(),
    Amount: Joi.required(),
})

const createTransactionFunction = async (req, res) => {
    const person = req.user
    const findUser = await User.findById(person.id)
    validateSchema(transactionSchema)
    if(!findUser) return errorResMsg(res, 400, { message: "Invalid user details" })
    const { data } = await axios.get(`${feeRateUrl}`)
    const feeRate = data.fastestFee
    const userBalance = await Balance.findOne({ userid: findUser._id })
    const lastFee = Transaction.findOne({$query: { userid: findUser._id}, $orderby: { $natural: -1 }})
    const minimumTotal = lastFee.fee + userBalance.amount
    if(amount > minimumTotal) return errorResMsg(res, 400, { message: "Insufficient balance" })
    const txnPbst = await createTransaction(findUser.address, req.RecipientAddress, Amount, findUser.address, feeRate.minimumFee)
}

const listTransaction = async (req, res) => {
    const person = req.user
    const findUser = await User.findById(person.id)
    if(!findUser) return errorResMsg(res, 400, { message: "Invalid user details" })
    const userTransactions = await Transaction.find({ userId: findUser._id })
    if(!userTransactions) return errorResMsg(res, 400, { message: 'User does not have any active transactions' })
    return successResMsg(res, 200, { message: userTransactions })
}

module.exports = {
    createTransactionFunction,
    listTransaction
}