//Server File  
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const cors = require("cors");
const { static } = require('express');
const app = express();

app.use(cors())
app.use(bodyParser.json());

app.use('/api',routes);
app.use(
    bodyParser.urlencoded({
        extended: false
    })
)
app.use('/files',express.static('uploads'));

app.get('/',function(req,res){
    res.send('connected to Server')
})


app.listen(process.env.PORT,()=> {
console.log("Server listening in port "+ process.env.PORT);
});



module.exports = app;