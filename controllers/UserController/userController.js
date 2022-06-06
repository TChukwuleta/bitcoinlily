const dotenv = require('dotenv')
const crypto = require('crypto')
dotenv.config()
const Joi = require("joi")
const jwt = require('jsonwebtoken')
const User = require('../../models/User/userModel')
const bcrypt = require('bcryptjs')
const { errorResMsg, successResMsg } = require('../../utils/libs/response')
const validateUser = require('../../utils/validations/validateSchema')
const { encryptData } = require('../../utils/libs/manageData')
const { getPrivateKey, getAddress } = require('../../bitcoin/btcFunctions')

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

    const privateKey = await getPrivateKey()
    const address = await getAddress(privateKey, derivationPath)
    const keydata = `${privateKey}+${hashPassword}`
    const epKey = await encryptData(keydata)

    const userData = await User.create({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.email,
        password: hashPassword,
        userid: epKey,
        address
    })
    return successResMsg(res, 201, { message: "User creation was successful", data: userData })
}

const loginUser = async(req, res) => {
    validateUser(loginSchema)
    const user = await User.findOne({ email: req.body.email })
    if(!user) return errorResMsg(res, 400, { message: "Invalid login details" })
    const verifyPassword = bcrypt.compare(req.body.password, user.password)
    if(!verifyPassword) return errorResMsg(res, 400, { message: "Invalid login details" })
    const signature = await createToken({
        id: user._id,
        email: user.email
    })
    return successResMsg(res, 201, { message: "login was successful", data: signature })
}