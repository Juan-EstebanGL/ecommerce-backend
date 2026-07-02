const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

router.get("/products/:id/reviews", getProductReviews);
router.post("/products/:id/reviews", authMiddleware, createReview);
router.put("/reviews/:id", authMiddleware, updateReview);
router.delete("/reviews/:id", authMiddleware, deleteReview);

module.exports = router;
