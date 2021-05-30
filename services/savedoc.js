let multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient('myblob');
const upload1 = require('./firebaseAdmin');
const upload = require('./firebaseAdmin');
let storage = multer.diskStorage({
    destination:(req,file,cb) => {
        console.log(req.body,file);
        
        cb(null,'./uploads')
    },filename:(req,file,cb) => {
        console.log(req.body,file);
        cb(null,file.originalname);
        console.log(file.originalname);
        upload1(`uploads/${file.originalname}`);
    }
    
})
module.exports = storage;