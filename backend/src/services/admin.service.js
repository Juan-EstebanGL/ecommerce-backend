const prisma = require("../lib/prisma");

const getSystemInfo = async () => {
  const [userCount, productCount, orderCount, reviewCount, favoriteCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.review.count(),
      prisma.favorite.count(),
    ]);

  return {
    version: "1.0.0",
    nodeVersion: process.version,
    database: "PostgreSQL",
    cloudinaryConfigured: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
    jwtConfigured: !!process.env.JWT_SECRET,
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()),
    stats: {
      users: userCount,
      products: productCount,
      orders: orderCount,
      reviews: reviewCount,
      favorites: favoriteCount,
    },
  };
};

const getDashboard = async () => {
  const [
    userCount,
    productCount,
    orderCount,
    favoriteCount,
    reviewCount,
    revenueResult,
    ordersByStatus,
    lowStockProducts,
    latestOrders,
    favoritedGroup,
    topRatedGroup,
    recentReviews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.favorite.count(),
    prisma.review.count(),
    prisma.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.product.findMany({
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, imageUrl: true, stock: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, email: true } },
      },
    }),
    prisma.favorite.groupBy({
      by: ["productId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.review.groupBy({
      by: ["productId"],
      _avg: { rating: true },
      _count: { id: true },
      orderBy: { _avg: { rating: "desc" } },
      take: 5,
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, email: true } },
        product: { select: { id: true, name: true, imageUrl: true } },
      },
    }),
  ]);

  const productIds = [
    ...favoritedGroup.map((f) => f.productId),
    ...topRatedGroup.map((r) => r.productId),
  ];

  const uniqueProductIds = [...new Set(productIds)];

  const products = uniqueProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: uniqueProductIds } },
        select: { id: true, name: true, imageUrl: true },
      })
    : [];

  const productMap = new Map(products.map((p) => [p.id, p]));

  const statusMap = {
    PENDING: 0,
    PAID: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  for (const entry of ordersByStatus) {
    statusMap[entry.status] = entry._count.id;
  }

  const mostFavoritedProducts = favoritedGroup.map((f) => ({
    id: f.productId,
    name: productMap.get(f.productId)?.name || "",
    imageUrl: productMap.get(f.productId)?.imageUrl || null,
    favorites: f._count.id,
  }));

  const topRatedProducts = topRatedGroup.map((r) => ({
    id: r.productId,
    name: productMap.get(r.productId)?.name || "",
    imageUrl: productMap.get(r.productId)?.imageUrl || null,
    averageRating: Number(Number(r._avg.rating).toFixed(2)),
    reviews: r._count.id,
  }));

  const latestOrdersResult = latestOrders.map((order) => ({
    id: order.id,
    usuario: { id: order.user.id, email: order.user.email },
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
  }));

  const recentReviewsResult = recentReviews.map((review) => ({
    usuario: { id: review.user.id, email: review.user.email },
    producto: {
      id: review.product.id,
      name: review.product.name,
      imageUrl: review.product.imageUrl,
    },
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }));

  return {
    stats: {
      users: userCount,
      products: productCount,
      orders: orderCount,
      favorites: favoriteCount,
      reviews: reviewCount,
      revenue: Number(revenueResult._sum.total || 0),
    },
    orders: {
      pending: statusMap.PENDING,
      paid: statusMap.PAID,
      processing: statusMap.PROCESSING,
      shipped: statusMap.SHIPPED,
      delivered: statusMap.DELIVERED,
      cancelled: statusMap.CANCELLED,
    },
    lowStockProducts,
    latestOrders: latestOrdersResult,
    mostFavoritedProducts,
    topRatedProducts,
    recentReviews: recentReviewsResult,
  };
};

module.exports = {
  getSystemInfo,
  getDashboard,
};
