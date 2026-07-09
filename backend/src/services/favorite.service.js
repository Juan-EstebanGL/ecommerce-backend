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

const getFavorites = async (userId) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: favoriteInclude,
    orderBy: { createdAt: "desc" },
  });

  return favorites.map(formatFavorite);
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

const getAdminFavoritesStats = async () => {
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
      totalFavorites: 0,
      totalUsersWithFavorites: 0,
      mostFavoritedProduct: null,
      averageFavoritesPerProduct: 0,
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

  const products = Array.from(productMap.values()).sort(
    (a, b) => b.totalFavorites - a.totalFavorites
  );

  const totalFavorites = favorites.length;
  const uniqueUsers = new Set(favorites.map((f) => f.userId));
  const totalUsersWithFavorites = uniqueUsers.size;
  const mostFavoritedProduct = products[0];
  const averageFavoritesPerProduct = products.length
    ? Number((totalFavorites / products.length).toFixed(2))
    : 0;

  return {
    products,
    totalFavorites,
    totalUsersWithFavorites,
    mostFavoritedProduct,
    averageFavoritesPerProduct,
  };
};

module.exports = {
  getFavorites,
  getAdminFavoritesStats,
  addFavorite,
  removeFavorite,
};
