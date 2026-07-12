const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const productSelect = {
  id: true,
  name: true,
  price: true,
  stock: true,
  imageUrl: true,
};

const favoriteInclude = {
  product: {
    select: productSelect,
  },
};

const formatFavorite = (favorite) => {
  if (!favorite) {
    return favorite;
  }

  return {
    ...favorite,
    product: favorite.product
      ? {
          ...favorite.product,
          price: Number(favorite.product.price),
        }
      : favorite.product,
  };
};

const getFavorites = async (userId, { page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      include: favoriteInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);

  return {
    data: favorites.map(formatFavorite),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

const addFavorite = async (userId, productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (existing) {
    throw new AppError("El producto ya está en favoritos", 409);
  }

  const favorite = await prisma.favorite.create({
    data: { userId, productId },
    include: favoriteInclude,
  });

  return formatFavorite(favorite);
};

const removeFavorite = async (userId, productId) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (!favorite) {
    throw new AppError("Favorito no encontrado", 404);
  }

  try {
    await prisma.favorite.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("Favorito no encontrado", 404);
    }

    throw error;
  }
};

const getAdminFavoritesStats = async ({ page = 1, limit = 8 } = {}) => {
  const favorites = await prisma.favorite.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!favorites.length) {
    return {
      products: [],
      total: 0,
      totalFavorites: 0,
      totalUsersWithFavorites: 0,
      mostFavoritedProduct: null,
      averageFavoritesPerProduct: 0,
      page: 1,
      totalPages: 0,
    };
  }

  const productMap = new Map();

  for (const fav of favorites) {
    const pid = fav.productId;
    if (!productMap.has(pid)) {
      productMap.set(pid, {
        id: fav.product.id,
        name: fav.product.name,
        imageUrl: fav.product.imageUrl,
        totalFavorites: 0,
      });
    }
    productMap.get(pid).totalFavorites++;
  }

  const allProducts = Array.from(productMap.values()).sort(
    (a, b) => b.totalFavorites - a.totalFavorites
  );

  const totalFavorites = favorites.length;
  const uniqueUsers = new Set(favorites.map((f) => f.userId));
  const totalUsersWithFavorites = uniqueUsers.size;
  const mostFavoritedProduct = allProducts[0];
  const averageFavoritesPerProduct = allProducts.length
    ? Number((totalFavorites / allProducts.length).toFixed(2))
    : 0;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 8));
  const skip = (pageNum - 1) * limitNum;
  const products = allProducts.slice(skip, skip + limitNum);

  return {
    products,
    total: allProducts.length,
    totalFavorites,
    totalUsersWithFavorites,
    mostFavoritedProduct,
    averageFavoritesPerProduct,
    page: pageNum,
    totalPages: Math.ceil(allProducts.length / limitNum),
  };
};

module.exports = {
  getFavorites,
  getAdminFavoritesStats,
  addFavorite,
  removeFavorite,
};
