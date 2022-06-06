const crypto = require('crypto')

const encryptData = (stringMessage) => {
    const algorithm = 'aes-256-cbc'
    const key = "adnan-tech-programming-computers"
    const initializedVector = crypto.randomBytes(16)
    // Encrypt string using algo, private key and initialization vector
    const cipher = crypto.createCipheriv(algorithm, key, initializedVector)
    let encryptDataValue = cipher.update(stringMessage, "utf-8", "hex")
    encryptDataValue += cipher.final("hex")
    // convert initializationvector to base 64 string
    const base64IV = Buffer.from(initializedVector, 'binary').toString('base64')
    console.log("Encrypted data: ", encryptDataValue)
    console.log("Initialization Vector: ", base64IV)
}

const decryptData = (encryptedString, IV) => {
    const originalIV = Buffer.from(IV, 'base64')
    const algorithm = 'aes-256-cbc'
    const key = "adnan-tech-programming-computers"
    const decipher = crypto.createDecipheriv(algorithm, key, originalIV)
    let decryptDataValue = decipher.update(encryptedString, "hex", "utf-8")
    decryptDataValue += decipher.final('utf-8')
    console.log("Decrypted string is: ", decryptDataValue)
}

encryptData("My name is Tobe")
decryptData("ba564c28d2e485234d4735a0e556b956", "c748v3TdN7O3kSMhB7uSHg==")
