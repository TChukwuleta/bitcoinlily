const express = require('express')
const router = express.Router()
const walletController = require('../../controllers/WalletController/walletController')

// Register user
router.post('/transact/:id', walletController.createTransactionFunction)
// get user
router.get('/walletbalance/:id', walletController.getUserWalletBalance)

module.exports = router