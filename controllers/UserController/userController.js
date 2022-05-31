const dotenv = require('dotenv')
dotenv.config()
const Joi = require("joi")
const User = require('../../models/User/userModel')
const bcrypt = require('bcryptjs')
const { errorResMsg, successResMsg } = require('../../utils/libs/response')
const validateUser = require('../../utils/validations/validateSchema')

// Registration schema
const registrationSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
})

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
})


const registerUser = async(req, res) => {
    validateUser(registrationSchema)
    const userExist = await User.findOne({ email: req.body.email })
    if(userExist) return errorResMsg(res, 400, { message: "User already exist" })
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    await User.create({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.email,
        password: hashPassword
    })
}