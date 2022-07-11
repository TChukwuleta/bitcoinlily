const bip39 = require("bip39")
const bip32 = require('bip32')
const bitcoin = require("bitcoinjs-lib")
const coinselect = require('coinselect')
const { successResMsg, errorResMsg } = require('../utils/libs/response')
const axios = require("axios")
const AppError = require('../utils/libs/appError')
const Balance = require('../models/Transaction/userBalance')
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
    const address = bitcoin.payments.p2pkh({
        pubkey: node.publicKey,
        network: network
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
    let senderBalance = 0
    const outputCount = 2
    let inputCount = 0
    let UtxoInputs = []
    console.log(`Sender address is: ${senderAddress}... recipient address is: ${recipientAddress}`)
 
    result.txs.forEach(element => { 
        let utxo = {}
        utxo.satoshis = Math.floor(Number(element.value) * 100000000)
        utxo.script = element.script_hex
        utxo.address = result.address
        utxo.txid = element.txid 
        utxo.outputIndex = element.output_no
        // const scriptHex = {
        //     script: Buffer.from(`${element.script_hex}`),
        //     value: Math.floor(Number(element.value) * 100000000)
        // }
        // utxo.witnessUtxo = scriptHex
        senderBalance += utxo.satoshis
        inputCount += 1
        UtxoInputs.push(utxo) 
    });
    console.log(UtxoInputs) 
     
    const transactionFee = inputCount * 146 - outputCount;
    //fee = transactionSize * 20 
    if(senderBalance - amountInSats - feeRate < 0) errorResMsg(res, 400, { message: "Insufficient balance" })
    if(feeRate > amountInSats) return errorResMsg(res, 400, { message: "Fee is too high" })
    transaction.from(UtxoInputs)
    transaction.to(recipientAddress, Math.floor(amountInSats))
    transaction.change(senderAddress)
    transaction.fee(transactionFee)
    transaction.sign(key)
    const serializeTxn = transaction.serialize({ disableDustOutputs: true })
    console.log(`Serialize Txn: ${serializeTxn}`)
    return serializeTxn
}


// Get transactions from user address
const getAddressUTXODetails = async(address) => {
    //const BASE_URL = "https://blockstream.info/api";
    // const { data } = await axios.get(
    //     `${BASE_URL}/address/${address.address}/txs`
    // );
    let balance = 0
    const { data } = await axios.get(`${BASE_URL}/get_tx_unspent/${chainNetwork}/${address}`)
    const result = data.data
    result.txs.forEach(element => { 
        let utxo = {}
        utxo.satoshis = Math.floor(Number(element.value) * 100000000)
        utxo.script = element.script_hex
        utxo.address = result.address
        utxo.txid = element.txid 
        utxo.outputIndex = element.output_no
        balance += utxo.satoshis
    });
    return balance
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

const CreateMultisigAddress = async (data) => {
    const network = bitcoin.networks.testnet
    const p2ms = bitcoin.payments.p2ms({
        m: data.m,
        pubkey: data.publicKeys,
        network
    })
    let multisigAddress;
    switch (data.scriptType) {
        case "P2SH":
          const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network })
          multisigAddress = p2sh.address
          const p2shOutput = p2sh.redeem.output
          return { p2shOutput, multisigAddress };
        case "P2WSH":
          const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network })
          multisigAddress = p2wsh.address
          const p2wshOutput = p2wsh.redeem.output
          return { p2wshOutput, multisigAddress };
        case "P2SHP2WSH":
          const p2wshh = bitcoin.payments.p2wsh({ redeem: p2ms, network })
          const p2shh = bitcoin.payments.p2sh({ redeem: p2wshh, network })
          multisigAddress = p2shh.address
          const p2shhOutput = p2shh.redeem.output
          const p2wshhOutput = p2wshh.redeem.output
          return { p2shhOutput, p2wshhOutput, multisigAddress }
    }
}
 

module.exports = {
    createTransaction,
    getAddressUTXODetails,
    broadcastTxn,
    getKeys,
    CreateMultisigAddress
}