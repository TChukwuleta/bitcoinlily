const bip39 = require("bip39")
const bip32 = require('bip32')
const bitcoin = require("bitcoinjs-lib")
const coinselect = require('coinselect')
const { successResMsg, errorResMsg } = require('../utils/libs/response')
const axios = require("axios")
const AppError = require('../utils/libs/appError')
const bitcore = require('bitcore-lib')

const chainNetwork = 'BTCTEST'
const BASE_URL = "https://sochain.com/api/v2"


// Generate new mnemonic and private key
const getKeys = async (path) => {
    const network = bitcoin.networks.testnet 
    const mnemonic = await bip39.generateMnemonic(256)
    const seed = await bip39.mnemonicToSeed(mnemonic)
    const root = await bip32.fromSeed(seed, network)
    const account = root.derivePath(path)
    const node = account.derive(0).derive(0)
    const privateKey = node.toWIF()
    const publicKey = node.publicKey
    const address = bitcoin.payments.p2wpkh({
        pubkey: node.publicKey,
        network: network.testnet
    }).address
    
    return {
        privateKey,
        publicKey,
        address
    } 
}

// Create a bitcoin transaction
const createTransaction = async (res, key, senderAddress, recipientAddress, amountInSats, feeRate) => {
    const { data } = await axios.get(`${BASE_URL}/get_tx_unspent/${chainNetwork}/${senderAddress}`)
    console.log(data)
    let result = data.data
    const transaction = new bitcore.Transaction()
    const senderBalance = 0
    let UtxoInputs = []
    console.log(`Sender address is: ${senderAddress}... recipient address is: ${recipientAddress}`)
 
    result.txs.forEach(element => { 
        let utxo = {}
        utxo.value = Math.floor(Number(element.value) * 100000000)
        utxo.script = element.script_hex
        utxo.address = res.address
        utxo.txid = element.txid 
        utxo.vout = element.output_no
        // const scriptHex = {
        //     script: Buffer.from(`${element.script_hex}`),
        //     value: Math.floor(Number(element.value) * 100000000)
        // }
        // utxo.witnessUtxo = scriptHex
        senderBalance += utxo.value
        UtxoInputs.push(utxo) 
    });
    console.log(UtxoInputs)
    
    if(senderBalance - amountInSats - feeRate < 0) errorResMsg(res, 400, { message: "Insufficient balance" })
    if(feeRate > amountInSats) return errorResMsg(res, 400, { message: "Fee is too high" })
    transaction.from(UtxoInputs)
    transaction.to(recipientAddress, Math.floor(amountInSats))
    transaction.change(senderAddress)
    transaction.fee(feeRate)
    transaction.sign(key)
    const serializeTxn = transaction.serialize({ disableDustOutputs: true })
    console.log(`Serialize Txn: ${serializeTxn}`)
    return serializeTxn
}


// Get transactions from user address
const getAddressTransactions = async(address) => {
    //const BASE_URL = "https://blockstream.info/api";
    // const { data } = await axios.get(
    //     `${BASE_URL}/address/${address.address}/txs`
    // );
    const { data } = await axios.get(`${BASE_URL}/get_tx_unspent/${chainNetwork}/${address}`)
    return data.data
}

const broadcastTxn = async(txHex) => {
    const { data } = await axios({
        method: "POST",
        url: `${BASE_URL}/send_tx/${chainNetwork}`,
        data: {
            tx_hex: txHex
        }
    })
    const output = `Successful: ${data.data}`
    return output
}
 

module.exports = {
    createTransaction,
    getAddressTransactions,
    broadcastTxn,
    getKeys

}