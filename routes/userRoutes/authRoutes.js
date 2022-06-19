const express = require('express')
const router = express.Router()
const userController = require('../../controllers/UserController/userController')

// Register user
router.post('/register', userController.registerUser)
// login user
router.post('/login', userController.loginUser)
// get user
router.get('/getuser/:id', userController.getUser)

module.exports = router