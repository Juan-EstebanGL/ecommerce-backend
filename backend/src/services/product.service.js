const prisma = require("../lib/prisma");

const createServiceError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureProductAccess = (product, userId, userRole, message) => {
  if (userRole !== "ADMIN" && product.userId !== userId) {
    throw createServiceError(403, message);
  }
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw createServiceError(404, "Producto no encontrado");
  }

  return product;
};

const createProduct = async (userId, data) => {
  return prisma.product.create({
    data: {
      ...data,
      userId,
    },
  });
};

const getProducts = async () => {
  return prisma.product.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
};

const updateProduct = async (userId, userRole, id, data) => {
  const existingProduct = await getProductById(id);

  ensureProductAccess(existingProduct, userId, userRole, "No autorizado");

  try {
    return await prisma.product.update({
      where: {
        id,
      },
      data,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw createServiceError(404, "Producto no encontrado");
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
      throw createServiceError(404, "Producto no encontrado");
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
  updateProduct,
  patchProduct,
  deleteProduct,
};
