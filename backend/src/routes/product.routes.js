const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  createProduct,
  getProducts,
  updateProduct,
  patchProduct,
  deleteProduct,
} = require("../controllers/product.controller");

router.post("/", authMiddleware, createProduct);

router.get("/", getProducts);

router.put("/:id", authMiddleware, updateProduct);

router.patch("/:id", authMiddleware, patchProduct);

router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
