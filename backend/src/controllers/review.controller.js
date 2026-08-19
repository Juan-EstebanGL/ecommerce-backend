const reviewService = require("../services/review.service");
const asyncHandler = require("../utils/asyncHandler");
const {
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
  reviewProductParamsSchema,
} = require("../validations/review.validation");
const { validate } = require("../validations/validation.helper");

const getProductReviews = asyncHandler(async (req, res) => {
  const data = validate(reviewProductParamsSchema, { params: req.params });

  const reviews = await reviewService.getProductReviews(data.params.id);

  return res.json(reviews);
}, "Error obteniendo reseñas");

const createReview = asyncHandler(async (req, res) => {
  const data = validate(createReviewSchema, {
    params: req.params,
    body: req.body || {},
  });

  const review = await reviewService.createReview(
    req.userId,
    data.params.id,
    data.body
  );

  return res.status(201).json(review);
}, "Error creando reseña");

const updateReview = asyncHandler(async (req, res) => {
  const data = validate(updateReviewSchema, {
    params: req.params,
    body: req.body || {},
  });

  const review = await reviewService.updateReview(
    req.userId,
    data.params.id,
    data.body
  );

  return res.json(review);
}, "Error actualizando reseña");

const getAllReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await reviewService.getAllReviews({ page, limit });
  return res.json(result);
}, "Error obteniendo reseñas");

const deleteReview = asyncHandler(async (req, res) => {
  const data = validate(reviewParamsSchema, { params: req.params });

  await reviewService.deleteReview(
    req.userId,
    data.params.id,
    req.userRole
  );

  return res.status(204).send();
}, "Error eliminando reseña");

module.exports = {
  getProductReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
};