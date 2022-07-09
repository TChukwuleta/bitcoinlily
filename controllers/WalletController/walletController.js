require('dotenv').config()
const validateSchema = require('../../utils/validations/validateSchema')
const axios = require('axios')
const User = require('../../models/User/userModel')
const Balance = require('../../models/Transaction/userBalance')
const Transaction = require('../../models/Transaction/transactionLogs')
const { errorResMsg, successResMsg } = require('../../utils/libs/response')
const { createTransaction, broadcastTxn, getAddressUTXODetails } = require('../../bitcoin/btcFunctions')
const { decryptData } = require('../../utils/libs/manageData')
const Joi = require('joi')

const baseFee = process.env.BaseFee ? process.env.BaseFee : 0.00000200
const feeRateUrl = 'https://mempool.space/signet/api/v1/fees/recommended'
const getKey = async (data, iv) => {
    const decrypted = await decryptData(data, iv)
    return decrypted.split("+")[0]
}

// Transaction schema
const transactionSchema = Joi.object({
    RecipientAddress: Joi.string().required(),
    Amount: Joi.required(),
})
 
const createTransactionFunction = async (req, res) => {
    //const person = req.user
    const { RecipientAddress, Amount } = req.body
    const person = req.params.id
    const findUser = await User.findById(person)
    //const findUser = await User.findById(person.id)
    validateSchema(transactionSchema)
    if(!findUser) return errorResMsg(res, 400, { message: "Invalid user details" })
    const { data } = await axios.get(`${feeRateUrl}`)
    const feeRate = data.fastestFee
    const userBalance = await Balance.findOne({ userid: findUser._id })
    const lastFee = Transaction.findOne({$query: { userid: findUser._id}, $orderby: { $natural: -1 }})
    const minimumTotal = lastFee.fee + userBalance.amount
    if(Amount > minimumTotal) return errorResMsg(res, 400, { message: "Insufficient balance" })
    const key = await getKey(findUser.userid, findUser.iv)
    const serializeTxn = await createTransaction(res, key, findUser.address, RecipientAddress, Amount, feeRate)
    const broadcast = await broadcastTxn(serializeTxn)
    if(!broadcast) return errorResMsg(res, 400, { message: "An error occured" })

    return successResMsg(res, 201, { message: `Transfer of ${Amount} was successful` })
}  

const listTransaction = async (req, res) => {
    const person = req.user
    const findUser = await User.findById(person.id)
    if(!findUser) return errorResMsg(res, 400, { message: "Invalid user details" })
    const userTransactions = await Transaction.find({ userId: findUser._id })
    if(!userTransactions) return errorResMsg(res, 400, { message: 'User does not have any active transactions' })
    return successResMsg(res, 200, { message: userTransactions })
}

const getUserWalletBalance = async (req, res) => {
    const person = req.params.id
    const findUser = await User.findById(person)
    if(!findUser) return errorResMsg(res, 400, { message: "Invalid user details" })
    const walletBalance = await getAddressUTXODetails(findUser.address)
    return successResMsg(res, 200, { message: `Balance is: ${walletBalance} satoshis` })
}

module.exports = {
    createTransactionFunction,
    listTransaction,
    getUserWalletBalance
}