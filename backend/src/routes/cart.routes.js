const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  addToCart,
  getCart,
} = require("../controllers/cart.controller");

router.post("/add", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);

module.exports = router;
