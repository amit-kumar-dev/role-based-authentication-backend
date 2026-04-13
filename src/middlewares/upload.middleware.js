const multer = require("multer");

// Max file size: 100MB (default) or from env
const maxFileSize = Number(process.env.MAX_FILE_SIZE || 100 * 1024 * 1024);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(new Error("No file provided"));
    }

    // ✅ filename & mimetype are safe here
    console.log(`📁 File received: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  },
});

module.exports = upload;
