const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './Uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type
const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|mp3|wav|mp4|mov|avi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Allowed file types are images (jpeg, jpg, png, gif), audio (mp3, wav), and video (mp4, mov, avi)!');
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Increased to 5MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'audioMessage', maxCount: 1 },
  { name: 'videoMessage', maxCount: 1 },
]);

module.exports = upload;