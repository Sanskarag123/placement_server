let multer = require('multer');
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