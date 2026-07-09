const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const { getSystemInfo, getDashboard } = require("../controllers/admin.controller");

router.get("/system", authMiddleware, adminMiddleware, getSystemInfo);
router.get("/dashboard", authMiddleware, adminMiddleware, getDashboard);

module.exports = router;
