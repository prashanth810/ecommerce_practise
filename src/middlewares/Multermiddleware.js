const multer = require("multer");

// store uploaded file in memory (buffer) for ImageKit
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
