const crypto = require('crypto')
require('dotenv').config()

const algorithm = 'aes-256-cbc'
const key = `${process.env.hashkey}`

const encryptData = async (stringMessage) => {
    const initializedVector = crypto.randomBytes(16)
    // Encrypt string using algo, private key and initialization vector
    const cipher = crypto.createCipheriv(algorithm, key, initializedVector)
    let encryptDataValue = cipher.update(stringMessage, "utf-8", "hex")
    encryptDataValue += cipher.final("hex")
    // convert initializationvector to base 64 string
    const base64IV = Buffer.from(initializedVector, 'binary').toString('base64')
    console.log("Encrypted data: ", encryptDataValue)
    console.log("Initialization Vector: ", base64IV)
    return {
        encryptDataValue,
        base64IV
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