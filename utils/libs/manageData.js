const crypto = require('crypto')
require('dotenv').config()

const algorithm = 'aes-256-cbc'
const key = `${process.env.hashkey}`

const encryptData = async (data) => {
    const initializationvector = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, key, initializationvector)
    let encryptedData = cipher.update(data, 'utf-8', 'hex')
    encryptedData = cipher.final('hex')
    // Convert IV to base64
    const base64IV = Buffer.from(initializationvector, 'binary').toString('base64')
    return {
        base64IV,
        encryptedData
    }
}

const decryptData = async (data, iv) => {
    const originalIV = Buffer.from(iv, 'base64')
    const decipher = crypto.createDecipheriv(algorithm, key, originalIV)
    let decryptedData =  decipher.update(data, 'hex', 'utf-8')
    decryptedData += decipher.final('utf-8')
    return decryptedData
} 

module.exports = {
    encryptData,
    decryptData
}