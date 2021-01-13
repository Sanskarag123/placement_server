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
    profile_url:String,
    speciliztion:String,
    nri:Boolean,
    dob:String,
    gender:String,
    section:String,
    dept:String,
    number:Number,
    arrears:Number,
    standingarrears:Number,
 achivements:{
     project:Array,
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
        college:{
            one:{
                percentage:String,
                url:String,
                verified:String,
            },
            two:{
                percentage:String,
                url:String,
                verified:String,
            },
            three:{
                percentage:String,
                url:String,
                verified:String,
            },
            four:{
                percentage:String,
                url:String,
                verified:String,
            },

        }
    },
    certificationDetails: {
        courses:[Object],
        workshops:[Object]
    },
    placementDetails:[{company:String,status:String,verified:{type:String,default:"pending"}}],
    skills:[{name:String}],
    CGPA:{type:String,default:'0'}

})

module.exports = schema

