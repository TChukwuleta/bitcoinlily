const express = require('express')
const path = require("path")
const morgan = require("morgan")
const dotenv = require("dotenv")
const helmet = require("helmet")
const authRoutes = require('./routes/userRoutes/authRoutes')
const mongoSanitize = require("express-mongo-sanitize")
const globalErrorHandler = require('./controllers/errorController')


dotenv.config()
const app = express()
// Set Security HTTP Headers
app.use(helmet())

if(process.env.NODE_ENV == 'development'){
    app.use(morgan("dev"))
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Data sanitize against NoSQL Query Injection
app.use(mongoSanitize())

app.get("/", (req, res) => {
    res.json({ message: "Welcome to BITCOINLILY" })
})

app.use(authRoutes);

app.all("*", (req, res) => {
    res.status(404).json({ message: `Can't find resource ${req.originalUrl} on this server` })
})

app.use(globalErrorHandler)

module.exports = app