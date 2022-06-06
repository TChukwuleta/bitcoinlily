const { generateMnemonic, mnemonicToSeed } = require("bip39")
const { fromSeed } = require('bip32')
const { networks, payments, bip32, Psbt } = require("bitcoinjs-lib")
const coinselect = require('coinselect')

// Generate new mnemonic
const getPrivateKey = async () => {
    const mnemonic = generateMnemonic(256)
    const seed = mnemonicToSeed(mnemonic)
    const privateKey = fromSeed(seed, networks.testnet)
    return privateKey
}

const getXPubFromPrivateKey = async (key, path) => {
    const child = key.derivePath(path).neutered()
    const xpub = child.toBase58()
    return xpub
}

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

module.exports = {
    getPrivateKey,
    getAddress
}