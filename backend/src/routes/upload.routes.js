const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { uploadLimiter } = require("../middleware/rateLimit.middleware");
const { uploadImage } = require("../controllers/upload.controller");

router.post("/image", authMiddleware, uploadLimiter, upload.single("image"), uploadImage);

module.exports = router;
