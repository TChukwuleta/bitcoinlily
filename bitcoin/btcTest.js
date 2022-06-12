const bitcoin = require('bitcoinjs-lib')
const bip32 = require('bip32')
const bip39 = require('bip39')
const axios = require('axios')
const bitcore = require('bitcore-lib')

// mk9oGiuXHNtVEL1VqKKwmjGosxbGBHuQzp
// bitcore.PrivateKey('testnet').toWIF()
const sendMoney = async () => {

    const network = bitcoin.networks.testnet //.bitcoin
    // Derivation path
    const path = `m/44'/0'/0'/0`
    const mmemonic = await bip39.generateMnemonic()
    const seed = await bip39.mnemonicToSeed(mmemonic)
    const root = await bip32.fromSeed(seed, network)
    const account = root.derivePath(path)
    const node = account.derive(0).derive(0)
    const btcAddress = bitcoin.payments.p2pkh({
        pubkey: node.publicKey,
        network: network
    }).address

    console.log(`
        Wallet generated:
        - Address: ${btcAddress}
        -Private Key: ${node.toWIF()},
        - Mmemonic: ${mmemonic},
        - Seed: ${seed},
        - Public Key: ${node.publicKey}
    `)
}

const makeTransaction = async (fromAddress, toAddress, amount) => {
    const network = bitcoin.networks.testnet
    const chainNetwork = 'BTCTEST'
    const transaction = new bitcore.Transaction()
    let inputs = []
    let totalAvailableAmount = 0
    let inputCount = 0
    const amountSatoshi = amount * 100000000
    const outputCount = 2

    const privateKey = 'cPT4bKFXo51HqHMa3W9HtdVAg5G75CxjCtmwhoDwr7oAfWoYqnxB'

    let res = await axios.get(`https://sochain.com/api/v2/get_tx_unspent/${chainNetwork}/${fromAddress}`)
    let data = res.data.data

    data.txs.forEach(element => {
        let utxo = {}
        utxo.satoshis = Math.floor(Number(element.value) * 100000000)
        utxo.script = element.script_hex
        utxo.address = res.address
        utxo.txid = element.txid
        utxo.outputIndex = element.output_no

        totalAvailableAmount += utxo.satoshis
        inputCount += 1
        inputs.push(utxo)
    });
 
    console.log(totalAvailableAmount)
    console.log(amountSatoshi)

    transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
    //fee = transactionSize * 20
    fee = 255
    if(totalAvailableAmount - amountSatoshi - fee < 0) throw new Error("Balance is too low for this transaction")

    transaction.from(inputs)
    transaction.to(toAddress, Math.floor(amountSatoshi))
    console.log(transaction)
    transaction.change(fromAddress)
    transaction.fee(fee)
    transaction.sign(privateKey)
    const serializeTxn = transaction.serialize({ disableDustOutputs: true })

    console.log(`Serialized Transaction: ${serializeTxn}`)
    

    // broadcast transaction
    const txn = await axios({
        method: "POST",
        url: `https://sochain.com/api/v2/send_tx/${chainNetwork}`,
        data: {
        tx_hex: serializeTxn,
        },
    });
    const txnOutput = txn.data.data
    console.log(`Finale: ${txnOutput}`)
    return txnOutput
}

//sendMoney()

//n4WvGJJTpY95gUpagLbuP3MXF2BVypfhGc
//ms4wBEx4extn6P4WbR8ihSFYxrHjRH2qDC
console.log(makeTransaction('n4WvGJJTpY95gUpagLbuP3MXF2BVypfhGc', 'mtVE8anM63kQcgKUC6oQQD9K6xiV4wsr7q', 0.000001))