const admin = require('firebase-admin');

const serviceAccount = require('./placement-1acb5-firebase-adminsdk-lb76t-aecc82fee8.json');
const os =  require('os')
var fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://placement-1acb5.appspot.com'
});

const bucket = admin.storage().bucket();
async function upload(uploadfrom="uploads/adhar.jpg"){
let response = await bucket.upload(uploadfrom);
var filePath = uploadfrom; 
fs.unlinkSync(filePath)
console.log(response);
}
module.exports = upload;