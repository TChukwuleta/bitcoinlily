const { generateMnemonic, mnemonicToSeed } = require("bip39")
const { fromSeed } = require('bip32')
const { networks, payments, bip32, Psbt } = require("bitcoinjs-lib")
const coinselect = require('coinselect')
const axios = require("axios")
const AppError = require('../utils/libs/appError')

const chainNetwork = 'BTCTEST'
const BASE_URL = "https://sochain.com/api/v2"

// Generate new mnemonic and private key
const getPrivateKey = async () => {
    const mnemonic = generateMnemonic(256)
    const seed = mnemonicToSeed(mnemonic)
    const privateKey = fromSeed(seed, networks.testnet)
    return privateKey
}

// Generate public key from private key
const getXPubFromPrivateKey = async (key, path) => {
    const child = key.derivePath(path).neutered()
    const xpub = child.toBase58()
    return xpub
}

// Generate wallet address
const getAddress = async (key, path) => {
    const xPubKey = await getXPubFromPrivateKey(key, path)
    const node = bip32.fromBase58(xPubKey, networks.testnet)
    const child = node.derivePath(path)
    const address = payments.p2wpkh({
        pubkey: child.publicKey,
        network: networks.testnet
    })
    return address
}

// Create a bitcoin transaction
const createTransaction = async (senderAddress, recipientAddress, amountInSats, changeAddress, feeRate) => {
    const { data } = await axios.get(`${BASE_URL}/get_tx_unspent/${chainNetwork}/${senderAddress}`)
    let res = data.data
    let UtxoInputs = []

    data.txs.forEach(element => {
        let utxo = {}
        utxo.value = Math.floor(Number(element.value) * 100000000)
        //utxo.script = element.script_hex
        //utxo.address = res.address
        utxo.txid = element.txid
        utxo.vout = element.output_no
        const scriptHex = {
            script: Buffer.from(`${element.script_hex}`),
            value: Math.floor(Number(element.value) * 100000000)
        }
        utxo.witnessUtxo = scriptHex
        UtxoInputs.push(utxo)
    });
    const { inputs, outputs, fee } = coinselect(
        utxos,
        [
            {
                address: recipientAddress,
                value: amountInSats
            }
        ],
        feeRate
    )
    if(!inputs || !outputs) throw new AppError("Unable to construct transaction", 400)
    if(fee > amountInSats) throw  new AppError("Fee is too high", 400)
    const psbt = new Psbt({ network: networks.testnet })

    inputs.forEach(input => {
        psbt.addInput({
            hash: input.txid,
            index: input.vout,
            sequence: 0xfffffffd,
            witnessUtxo: {
                value: input.value,
                script: input.address.output
            },
            bip32Derivation: input.bip32Derivation
        })
    });

    outputs.forEach(output => {
        if(!output.address){
            output.address = changeAddress
        }
        psbt.addOutput({
            address: output.address,
            value: output.value
        })
    })
    return psbt
}


// Sign Transactions using the private key
const signTransaction = async (psbt, key) => {
    psbt.signAllInputsHD(key)
    psbt.validateSignaturesOfAllInputs()
    psbt.finalizeAllInputs()
    return psbt
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
    getPrivateKey,
    getAddress,
    createTransaction,
    signTransaction,
    getAddressTransactions,
    broadcastTxn

}