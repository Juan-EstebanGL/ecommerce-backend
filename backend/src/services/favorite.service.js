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

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
