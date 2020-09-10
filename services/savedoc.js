let multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient('myblob');
let storage = multer.diskStorage({
    destination:(req,file,cb) => {
        console.log(req.body,file);
        
        cb(null,'./uploads')
    },filename:(req,file,cb) => {
        console.log(req.body,file);
        cb(null,file.originalname);
    }
})
module.exports = storage;