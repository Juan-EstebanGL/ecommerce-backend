const reviewService = require("../services/review.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
} = require("../validations/review.validation");
const {
  getZodErrorMessage,
} = require("../validations/validation.helper");

const getProductReviews = asyncHandler(async (req, res) => {
  const validation = reviewParamsSchema.safeParse({
    params: req.params,
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const reviews = await reviewService.getProductReviews(
    validation.data.params.id
  );

  return res.json(reviews);
}, "Error obteniendo reseñas");

const createReview = asyncHandler(async (req, res) => {
  const validation = createReviewSchema.safeParse({
    params: req.params,
    body: req.body || {},
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const review = await reviewService.createReview(
    req.userId,
    validation.data.params.id,
    validation.data.body
  );

  return res.status(201).json(review);
}, "Error creando reseña");

const updateReview = asyncHandler(async (req, res) => {
  const validation = updateReviewSchema.safeParse({
    params: req.params,
    body: req.body || {},
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const review = await reviewService.updateReview(
    req.userId,
    validation.data.params.id,
    validation.data.body
  );

  return res.json(review);
}, "Error actualizando reseña");

const getAllReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await reviewService.getAllReviews({ page, limit });
  return res.json(result);
}, "Error obteniendo reseñas");

const deleteReview = asyncHandler(async (req, res) => {
  const validation = reviewParamsSchema.safeParse({
    params: req.params,
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  await reviewService.deleteReview(
    req.userId,
    validation.data.params.id,
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
