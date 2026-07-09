const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const { getUsers, updateUserRole, deleteUser } = require("../controllers/user.controller");

router.get("/", authMiddleware, adminMiddleware, getUsers);
router.patch("/:id/role", authMiddleware, adminMiddleware, updateUserRole);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
