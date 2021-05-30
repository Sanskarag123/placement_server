const admin = require('firebase-admin');

const serviceAccount = require('./placement-1acb5-firebase-adminsdk-lb76t-aecc82fee8.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://placement-1acb5.appspot.com'
});

const bucket = admin.storage().bucket();
async function upload(){
let response = await bucket.upload('uploads/adhar.jpg')
console.log(response);
}
module.exports = upload;