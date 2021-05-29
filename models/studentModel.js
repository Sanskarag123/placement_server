//model  File 
let moongoose = require('mongoose')
const schema = moongoose.Schema({
    email:String,
    password:String,
    registrationNumber:String,
    verified:Boolean,
    name:String, 
    faculty:String,
    facultyId:{type:String,default:"102253"},
    acad:String,
    date:String,
    profile_url:{type:String,default:""},
    specilization:String,
    nri:{type:Boolean,default:false},
    dob:{type:String,default:''},
    personalemail:String,
    gender:String,
    section:String,
    dept:String,
    number:Number,
    arrears:Number,
    standingarrears:Number,
 achivements:{
     project:{type:Array},
     hackathons:Array,
     codingcontests:Array,
     otherachievements:Array
 },
    personalDetails:{
        address:String,
    },
    educationDetails:{
        school :{
            X:{
                percentage:String,
                url:String,
                verified:String,

            },
            XII:{
                percentage:String,
                url:String,
                verified:String,
            }
        },
        college:[
            Object]
    },
    certificationDetails: {
        courses:[Object],
        workshops:[Object],
        intcertifications:[Object],
        internships:[Object]
    },
    placementDetails:[{company:String,status:String,verified:{type:String,default:"pending"},startdate:String,position:String}],
    skills:[Object],
    CGPA:{type:String,default:'0'}

})

module.exports = schema

