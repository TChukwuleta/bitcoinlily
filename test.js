const crypto = require('crypto')
const User = require('./models/User/userModel')
const btc = require('./bitcoin/btcFunctions')

const encryptData = async (stringMessage) => {
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
    console.log(decipher)
    let decryptDataValue = decipher.update(encryptedString, "hex", "utf-8")
    decryptDataValue += decipher.final('utf-8')
    console.log("Decrypted string is: ", decryptDataValue)
}

//console.log(getKey())
//decryptData("6d44b81d593aa9714e908605a3179897", "PHz7w9Dqp6AEO0Z7NjDa8w==")
//decryptData("0938b00a5737d0a96f3391b4c0af653a", "EU0M0zkltdRRog6iBThtyA==")
//encryptData("cTybg97LkUbK2B6pwpdfMF4eEzfMY5JcNiFpvJ5rJVqq9h9AZPTk+$2a$10$6dhSMAoJq.cy0JlypUHJieeS0SdkzivUydh.gbauNf4gRr2.S/ZEq")
decryptData("49c75a664b8201a084b09e5e9ed9632aaaa4f64b97d70d87cfa7e90851bbb3c5d7a0ceea9ab1530a884df036a19cb9d15522fe3d17c87a07302ff0ff9c5aa8e3cb5b2078f7fb104b72f34635e9bcf12f54f5951efa7ae9609e29db006ba65de6e2107aca8be0131967631c45166628e6c33e99a5c76207e72aec7a3939acfd2e", "SW5RP4cCx212mTPKQB5ngg==")
//decryptData("7c60ef89da47e33f157a6072daa04b09", "bGJquUqfGQPaGETmeVcJ7g==")

//decryptData("88ebd762047a6df4d0ac9cae0b7e4c38","K4RiWAeLft+ACDJl8w+Stg==")