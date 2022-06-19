const dotenv = require('dotenv')
const crypto = require('crypto')
dotenv.config()
const Joi = require("joi")
const jwt = require('jsonwebtoken')
const User = require('../../models/User/userModel')
const Transaction = require('../../models/Transaction/transactionLogs')
const Balance = require('../../models/Transaction/userBalance')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const { errorResMsg, successResMsg } = require('../../utils/libs/response')
const validateUser = require('../../utils/validations/validateSchema')
const { encryptData } = require('../../utils/libs/manageData')
const { getKeys } = require('../../bitcoin/btcFunctions')

// Derivation path 
const derivationPath = "m/84'/0'/0'"; // P2WPKH

// Registration schema
const registrationSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
})

// login schema
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
})

// Token
const createToken = async (payload) => {
    jwt.sign(payload, `${process.env.tokenSecret}`, {
        expiresIn: 6*60*60
    })
}


const registerUser = async(req, res) => {
    validateUser(registrationSchema)
    const userExist = await User.findOne({ email: req.body.email })
    if(userExist) return errorResMsg(res, 400, { message: "User already exist" })
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    const keys = await getKeys(derivationPath)
    console.log(`Private key: ${keys.privateKey}`)
    console.log(`Password hash: ${hashPassword}`)
    const keydata = `${keys.privateKey}+${hashPassword}`
    console.log(`Key data is: ${keydata}`)
    const epKey = await encryptData(keydata) 

    const userData = await User.create({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.email,
        password: hashPassword,
        userid: epKey.encryptDataValue,
        iv: epKey.base64IV,
        address: keys.address,
        pubkey: keys.publicKey
    })
    console.log(userData)

    const userBalance = await Balance.create({
        address: keys.address,
        userid: userData._id,
        amount: 0
    })
    return successResMsg(res, 201, { message: "User creation was successful", userDetails: userData, walletDetails: userBalance })
}

const loginUser = async(req, res) => {
    validateUser(loginSchema)
    const user = await User.findOne({ email: req.body.email })
    if(!user) return errorResMsg(res, 400, { message: "Invalid login details" })
    console.log(user)
    const verifyPassword = bcrypt.compare(req.body.password, user.password)
    if(!verifyPassword) return errorResMsg(res, 400, { message: "Invalid login details" })
    const signature = await createToken({
        id: user._id,
        email: user.email,
        iat: moment().unix()
    })
    console.log(signature)
    return successResMsg(res, 201, { message: "login was successful", data: signature })
}

const getUserAddressAndBalance = async (req, res) => {
    const person = req.user
    const findUser = await User.findById(person.id)
    if(!findUser) return errorResMsg(res, 400, { message: "Invalid user details" })
    const findUserWallet = await Balance.findOne({ userid: findUser._id })
    if(!findUserWallet) return errorResMsg(res, 400, { message: "Invalid user details" })
    return successResMsg(res, 200, { message: findUserWallet })
}

const getUser = async (req, res) => {
    const person = req.params.id
    const findUser = await User.findById(person)
    if(!findUser) return errorResMsg(res, 400, { message: "Invalid user details" })
    return successResMsg(res, 200, { message: findUser })
}

const getAllUsers = async (req, res) => {
    const getUsers = await User.find()
    if(!getUsers) return errorResMsg(res, 400, { message: "Invalid user details" })
    return successResMsg(res, 200, { message: getUsers })
}


module.exports = {
    registerUser,
    loginUser,
    getUserAddressAndBalance,
    getUser,
    getAllUsers
}