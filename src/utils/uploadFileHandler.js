const multer = require("multer");
const path = require("path");

const FILE_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValidFileType = FILE_TYPE[file.mimetype];
    let uploadError = new Error("Invalid image type");

    if (isValidFileType) {
      uploadError = null;
    }

    cb(uploadError, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueFileName = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
