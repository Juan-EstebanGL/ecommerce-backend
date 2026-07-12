const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const getProductReviews = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: {
      id: review.user.id,
      email: review.user.email,
    },
  }));
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
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: {
      id: review.user.id,
      email: review.user.email,
    },
  };
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

const ensureReviewOwner = (review, userId, userRole) => {
  if (userRole !== "ADMIN" && review.userId !== userId) {
    throw new AppError("No autorizado", 403);
  }
};

const getAllReviews = async ({ page = 1, limit = 8 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 8));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
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
  ]);

  return {
    data: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        id: review.user.id,
        email: review.user.email,
      },
      product: {
        id: review.product.id,
        name: review.product.name,
        imageUrl: review.product.imageUrl,
      },
    })),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

const updateReview = async (userId, reviewId, data) => {
  const review = await getReviewById(reviewId);

  ensureReviewOwner(review, userId);

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    rating: updated.rating,
    comment: updated.comment,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    user: {
      id: updated.user.id,
      email: updated.user.email,
    },
  };
};

const deleteReview = async (userId, reviewId, userRole) => {
  const review = await getReviewById(reviewId);

  ensureReviewOwner(review, userId, userRole);

  try {
    await prisma.review.delete({
      where: { id: reviewId },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("Reseña no encontrada", 404);
    }

    throw error;
  }
};

module.exports = {
  getProductReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
};
