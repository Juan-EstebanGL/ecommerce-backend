const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

router.post("/checkout", authMiddleware, createOrder);
router.get("/", authMiddleware, getMyOrders);
router.patch("/:id/status", authMiddleware, updateOrderStatus);
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;
