const multer = require("multer");
const AppError = require("../utils/AppError");

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(
        new AppError("Solo se permiten imágenes JPG, JPEG, PNG o WebP", 400),
        false
      );
    }

    cb(null, true);
  },
});

module.exports = upload;
