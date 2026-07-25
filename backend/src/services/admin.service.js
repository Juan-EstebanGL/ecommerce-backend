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
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

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
    monthlyRevenueData,
    monthlyOrdersData,
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
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
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
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        product: { select: { id: true, name: true, imageUrl: true } },
      },
    }),
    prisma.order.findMany({
      where: {
        status: "DELIVERED",
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { total: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { createdAt: true },
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
    usuario: { id: order.user.id, email: order.user.email, firstName: order.user.firstName, lastName: order.user.lastName },
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
  }));

  const recentReviewsResult = recentReviews.map((review) => ({
    usuario: { id: review.user.id, email: review.user.email, firstName: review.user.firstName, lastName: review.user.lastName },
    producto: {
      id: review.product.id,
      name: review.product.name,
      imageUrl: review.product.imageUrl,
    },
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }));

  const MONTHS_SHORT = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  const monthlyMap = new Map();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + "-" + String(d.getMonth()).padStart(2, "0");
    monthlyMap.set(key, { month: MONTHS_SHORT[d.getMonth()], revenue: 0, sortKey: key });
  }

  for (const order of monthlyRevenueData) {
    const d = order.createdAt;
    const key = d.getFullYear() + "-" + String(d.getMonth()).padStart(2, "0");
    if (monthlyMap.has(key)) {
      monthlyMap.get(key).revenue += Number(order.total);
    }
  }

  const monthlyRevenue = Array.from(monthlyMap.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ month, revenue }) => ({ month, revenue }));

  const monthlyOrdersMap = new Map();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + "-" + String(d.getMonth()).padStart(2, "0");
    monthlyOrdersMap.set(key, { month: MONTHS_SHORT[d.getMonth()], orders: 0, sortKey: key });
  }

  for (const order of monthlyOrdersData) {
    const d = order.createdAt;
    const key = d.getFullYear() + "-" + String(d.getMonth()).padStart(2, "0");
    if (monthlyOrdersMap.has(key)) {
      monthlyOrdersMap.get(key).orders += 1;
    }
  }

  const monthlyOrders = Array.from(monthlyOrdersMap.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ month, orders }) => ({ month, orders }));

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
    monthlyRevenue,
    monthlyOrders,
  };
};

module.exports = {
  getSystemInfo,
  getDashboard,
};
