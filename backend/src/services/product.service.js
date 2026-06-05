const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const ensureProductAccess = (product, userId, userRole, message) => {
  if (userRole !== "ADMIN" && product.userId !== userId) {
    throw new AppError(message, 403);
  }
};

const formatProduct = (product) => {
  if (!product) {
    return product;
  }

  return {
    ...product,
    price: Number(product.price),
  };
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }

  return formatProduct(product);
};

const createProduct = async (userId, data) => {
  const product = await prisma.product.create({
    data: {
      ...data,
      userId,
    },
  });

  return formatProduct(product);
};

const getProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  return products.map(formatProduct);
};

const updateProduct = async (userId, userRole, id, data) => {
  const existingProduct = await getProductById(id);

  ensureProductAccess(existingProduct, userId, userRole, "No autorizado");

  try {
    const product = await prisma.product.update({
      where: {
        id,
      },
      data,
    });

    return formatProduct(product);
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("Producto no encontrado", 404);
    }

    throw error;
  }
};

const patchProduct = async (userId, userRole, id, data) => {
  return updateProduct(userId, userRole, id, data);
};

const deleteProduct = async (userId, userRole, id) => {
  const existingProduct = await getProductById(id);

  ensureProductAccess(
    existingProduct,
    userId,
    userRole,
    "Usuario no autorizado"
  );

  try {
    await prisma.product.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("Producto no encontrado", 404);
    }

    throw error;
  }

  return {
    message: "Producto eliminado",
  };
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  patchProduct,
  deleteProduct,
};
