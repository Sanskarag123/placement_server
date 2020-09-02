//model  File 
let moongoose = require('mongoose')
const schema = moongoose.Schema({
    email:String,
    password:String,
    registrationNumber:String,
    verified:Boolean,
    name:String, 
    faculty:String,
    number:Number,
    personalDetails:{
        address:String,
    },
    educationDetails:{
        school :Object,
        college:Object
    },
    certificationDetails: {
        courses:[Object],
        workshops:[Object]
    }

})

module.exports = schema

