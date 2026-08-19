const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { paginate } = require("../utils/pagination");
const { assertOwnerOrAdmin } = require("../utils/ownership");

const REVIEW_USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
};

const reviewUserInclude = {
  user: {
    select: REVIEW_USER_SELECT,
  },
};

const formatReview = (review) => {
  if (!review) {
    return review;
  }

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: {
      id: review.user.id,
      email: review.user.email,
      firstName: review.user.firstName,
      lastName: review.user.lastName,
      avatarUrl: review.user.avatarUrl,
    },
  };
};

const getProductReviews = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: reviewUserInclude,
    orderBy: { createdAt: "desc" },
  });

  return reviews.map(formatReview);
};

const createReview = async (userId, productId, data) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingReview) {
    throw new AppError("Ya has realizado una reseña para este producto", 409);
  }

  const review = await prisma.review.create({
    data: {
      rating: data.rating,
      comment: data.comment,
      userId,
      productId,
    },
    include: reviewUserInclude,
  });

  return formatReview(review);
};

const getReviewById = async (reviewId) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError("Reseña no encontrada", 404);
  }

  return review;
};

const getAllReviews = async ({ page = 1, limit = 8 } = {}) => {
  const { pageNum, limitNum, skip } = paginate(page, limit, 8);

  const [reviews, total, avgResult, totalFiveStar, totalOneStar] = await Promise.all([
    prisma.review.findMany({
      include: {
        ...reviewUserInclude,
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.review.count({ where: { rating: 5 } }),
    prisma.review.count({ where: { rating: 1 } }),
  ]);

  return {
    data: reviews.map((review) => ({
      ...formatReview(review),
      product: {
        id: review.product.id,
        name: review.product.name,
        imageUrl: review.product.imageUrl,
      },
    })),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    stats: {
      averageRating: avgResult._avg.rating
        ? Number(avgResult._avg.rating.toFixed(1))
        : null,
      totalFiveStar,
      totalOneStar,
    },
  };
};

const updateReview = async (userId, reviewId, data) => {
  const review = await getReviewById(reviewId);

  assertOwnerOrAdmin(undefined, userId, review.userId, "No autorizado");

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: data.rating,
      comment: data.comment,
    },
    include: reviewUserInclude,
  });

  return formatReview(updated);
};

const deleteReview = async (userId, reviewId, userRole) => {
  const review = await getReviewById(reviewId);

  assertOwnerOrAdmin(userRole, userId, review.userId, "No autorizado");

  await prisma.review.delete({
    where: { id: reviewId },
  });
};

module.exports = {
  getProductReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
};
