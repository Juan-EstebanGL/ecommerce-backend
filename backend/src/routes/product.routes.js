const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  createProduct,
  getProducts,
  updateProduct,
  patchProduct,
  deleteProduct,
} = require("../controllers/product.controller");

router.post("/", authMiddleware, adminMiddleware, createProduct);

router.get("/", getProducts);

router.put("/:id", authMiddleware, adminMiddleware, updateProduct);

router.patch("/:id", authMiddleware, adminMiddleware, patchProduct);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
