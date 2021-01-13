//model  File 
let connection = require('../services/connection')
let moongoose = require('mongoose')
const schema = moongoose.Schema({
    email:String,
    password:String,
    facultyId:String,
    number:String,
    totalstudents:Number,
    name:String,
})

module.exports = schema

