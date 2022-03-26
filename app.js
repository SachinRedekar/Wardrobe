const express = require('express')
const mongoose = require('mongoose')
const createError = require('http-errors')
const morgan = require('morgan')
require('dotenv').config()
require('./helpers/init_MongoDb')

const AuthRoute = require('./Routes/Auth.Route')

const app = express()

app.use(morgan('dev'))

app.use(express.json())
app.use(express.urlencoded({extended : true}))

app.get('/', async (req, res, next) => {
    res.send("Hello From Sachin")
})

app.use('/auth', AuthRoute)

app.use( async (req, res, next) => {
    next(createError.NotFound())
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error :{
            status : err.status || 500,
            message : err.message
        }
    })
})



PORT = process.env.PORT || 8000

app.listen(PORT, (req, res, nexr) => {
    console.log(`Server Started on PORT ${PORT}.....`)
})