//model  File 
let connection = require('../services/connection')
let moongoose = require('mongoose')
const schema = moongoose.Schema({
    email:String,
    password:String,
    facultyID:String,

})

module.exports = schema

