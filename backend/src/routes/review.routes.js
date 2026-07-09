const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  getProductReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

router.get("/products/:id/reviews", getProductReviews);
router.post("/products/:id/reviews", authMiddleware, createReview);
router.put("/reviews/:id", authMiddleware, updateReview);
router.delete("/reviews/:id", authMiddleware, deleteReview);
router.get("/reviews/admin", authMiddleware, adminMiddleware, getAllReviews);

module.exports = router;
