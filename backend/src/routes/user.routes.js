const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getMyStats,
  updateAvatar,
  deleteAvatar,
  updateProfile,
  changePassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/user.controller");

router.put("/me/avatar", authMiddleware, upload.single("image"), updateAvatar);
router.delete("/me/avatar", authMiddleware, deleteAvatar);
router.get("/me/stats", authMiddleware, getMyStats);
router.put("/me/profile", authMiddleware, updateProfile);
router.put("/me/password", authMiddleware, changePassword);
router.get("/me/addresses", authMiddleware, getAddresses);
router.post("/me/addresses", authMiddleware, createAddress);
router.put("/me/addresses/:id", authMiddleware, updateAddress);
router.delete("/me/addresses/:id", authMiddleware, deleteAddress);
router.patch("/me/addresses/:id/default", authMiddleware, setDefaultAddress);
router.get("/", authMiddleware, adminMiddleware, getUsers);
router.patch("/:id/role", authMiddleware, adminMiddleware, updateUserRole);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
