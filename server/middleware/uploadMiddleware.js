const multer = require('multer');
const path = require('path');

const fileStorage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('unsupported file type, only pdf, jpg, and png are allowed'), false);
  }
}

const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: fileFilter
}).single('file');

function handleUpload(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'file is too large, maximum size is 5MB' });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'no file uploaded' });
    }
    
    next();
  });
}

module.exports = handleUpload;
