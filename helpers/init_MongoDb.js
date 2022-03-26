const mongoose = require('mongoose')
require('dotenv/config')

mongoose.connect(process.env.MongoDB, (req, res, next) => {
    console.log('Connected To MongoDatabase...')
})


mongoose.connection.on('connected',()=>{
    console.log("Mongoose Connected TO DB....")
})

mongoose.connection.on('error', (err) => {
    console.log(err.message)
})

mongoose.connection.on('disconnected', ()=> {
    console.log('Mongoose Connection IS DisConnected....')
})

process.on('SIGINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
})