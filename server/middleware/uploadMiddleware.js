const multer = require('multer');
const path = require('path');
const { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } = require('../config/constants');

const fileStorage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const hasAllowedExtension = allowedExtensions.includes(fileExtension);
  const hasAllowedMime = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (hasAllowedExtension && hasAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error('unsupported file type, only pdf, jpg, and png are allowed'), false);
  }
}

const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
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
