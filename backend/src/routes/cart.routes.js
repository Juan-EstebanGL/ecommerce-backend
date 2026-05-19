const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
} = require("../controllers/cart.controller");

router.post("/add", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.patch("/:id", authMiddleware, updateCartItem);
router.delete("/:id", authMiddleware, deleteCartItem);

module.exports = router;
