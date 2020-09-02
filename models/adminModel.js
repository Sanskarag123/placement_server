//model  File 
let connection = require('../services/connection')
let moongoose = require('mongoose')
const schema = moongoose.Schema({
    aminNumber:String,
    password:String,
    position:String
   

})

module.exports = schema

