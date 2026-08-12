const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const cloudinaryService = require("./cloudinary.service");

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
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }

  return formatProduct(product);
};

const createProduct = async (userId, data) => {
  const { imageUrl, publicId, categoryId, ...productData } = data;

  try {
    const product = await prisma.product.create({
      data: {
        ...productData,
        imageUrl: imageUrl || null,
        publicId: publicId || null,
        userId,
        categoryId: categoryId ? Number(categoryId) : null,
      },
      include: { category: true },
    });

    return formatProduct(product);
  } catch (error) {
    if (publicId) {
      await cloudinaryService.deleteImage(publicId).catch(() => {});
    }

    throw error;
  }
};

const getProducts = async ({ page = 1, limit = 20, categoryId } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const where = categoryId ? { categoryId: parseInt(categoryId, 10) } : {};

  const [products, total, totalAvailable, totalLowStock, totalOutOfStock] = await Promise.all([
    prisma.product.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        category: true,
      },
      where,
      skip,
      take: limitNum,
      orderBy: { id: "desc" },
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { ...where, stock: { gt: 5 } } }),
    prisma.product.count({ where: { ...where, stock: { gt: 0, lte: 5 } } }),
    prisma.product.count({ where: { ...where, stock: 0 } }),
  ]);

  return {
    data: products.map(formatProduct),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    stats: {
      totalAvailable,
      totalLowStock,
      totalOutOfStock,
    },
  };
};

const updateProduct = async (userId, userRole, id, data) => {
  const existingProduct = await getProductById(id);

  ensureProductAccess(
    existingProduct,
    userId,
    userRole,
    "No autorizado"
  );

  const { imageUrl, publicId, categoryId, ...productData } = data;

  const categoryUpdate =
    categoryId !== undefined
      ? { categoryId: categoryId ? Number(categoryId) : null }
      : {};

  const previousPublicId = existingProduct.publicId;
  const hasNewImage = Boolean(
    publicId && previousPublicId && publicId !== previousPublicId
  );

  let product;

  try {
    product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...productData,
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(publicId !== undefined ? { publicId } : {}),
        ...categoryUpdate,
      },
      include: { category: true },
    });
  } catch (error) {
    if (publicId && publicId !== previousPublicId) {
      await cloudinaryService.deleteImage(publicId).catch(() => {});
    }

    if (error.code === "P2025") {
      throw new AppError("Producto no encontrado", 404);
    }

    throw error;
  }

  if (hasNewImage) {
    try {
      await cloudinaryService.deleteImage(previousPublicId);
    } catch (error) {
      console.error(
        "[product] No se pudo eliminar la imagen anterior:",
        error.message
      );
    }
  }

  return formatProduct(product);
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

  if (existingProduct.publicId) {
    await cloudinaryService.deleteImage(existingProduct.publicId);
  }

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
