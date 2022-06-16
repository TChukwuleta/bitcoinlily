require('dotenv').config()
const mongoose = require('mongoose')

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION!...')
    console.log({ err })
    console.log(err.name, err.message)
    process.exit()
})
const app = require('./app')

const DB = 'mongodb://localhost:27017/lillywallet' // DB connection

mongoose
.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Console to DB successfully...")
})

mongoose.connection.on('error', (err) => console.log(err.message))
mongoose.connection.on('disconnected', () =>
    console.log('Mongoose connection closed')
)

const normalizePort = (val) => {
    const port = parseInt(val, 10)
    if(!Number.isNaN(port)){
        return val;
    }
    if(port > 0){
        return port
    }
    return false
}

const port = normalizePort(process.env.PORT || '8888')
// Create a http server
const server = app.listen(port, async() => {
    const address = server.address()
    const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`;
    console.log(`Listening on ${bind}`);
})

// Catching Exceptions

// Application does not necessarily need to be crashed
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!...');
  console.log(err.name, err.message);
  console.log({err});
  server.close(() => {
    process.exit();
  });
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

