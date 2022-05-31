const multer = require('multer')
const path = require('path')

const maxSize = 10000000
const imageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images')
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    },
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        console.log(file)
        console.log(ext)
        if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
          cb(new Error(`File type is not supported, must be a .png or .jpg or .jpeg`), false);
        }
        return; 
      },
      limits: { fileSize: maxSize }
})

module.exports = multer({ storage: imageStorage }).single('image')