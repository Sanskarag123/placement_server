//Connection File 
let moongoose = require('mongoose')
require('dotenv').config();
let studentModel = require('../models/studentModel')
let db_URL = 'mongodb+srv://san:1234@cluster0.nmxs5.mongodb.net/placementPortal?retryWrites=true&w=majority';
connectTodb = async function() {
    try{
        let db_instanece = await moongoose.connect(db_URL,{ useNewUrlParser: true,useUnifiedTopology: true, })
        console.log('Connected to Database');
        return db_instanece;
    }
    catch(err) {
        throw 'Not Connected to database';
    }
    
}
studentCol = () => {
    return connectTodb().then(model => {
        return model.model('student',studentModel,'student')
    }).catch( err => {
        throw err
    })
}

module.exports = {connectTodb,studentCol};