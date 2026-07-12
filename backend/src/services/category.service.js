const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const cloudinaryService = require("./cloudinary.service");

const getCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    imageUrl: c.imageUrl,
    publicId: c.publicId,
    productCount: c._count.products,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
};

const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          imageUrl: true,
        },
        orderBy: { id: "desc" },
      },
    },
  });

  if (!category) {
    throw new AppError("Categoría no encontrada", 404);
  }

  return {
    id: category.id,
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl,
    publicId: category.publicId,
    productCount: category._count.products,
    products: category.products.map((p) => ({
      ...p,
      price: Number(p.price),
    })),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

const createCategory = async (data) => {
  const { imageUrl, publicId, ...categoryData } = data;

  const existing = await prisma.category.findFirst({
    where: { name: { equals: categoryData.name, mode: "insensitive" } },
  });

  if (existing) {
    throw new AppError("Ya existe una categoría con ese nombre", 409);
  }

  try {
    const category = await prisma.category.create({
      data: {
        ...categoryData,
        imageUrl: imageUrl || null,
        publicId: publicId || null,
      },
    });

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      publicId: category.publicId,
      productCount: 0,
    };
  } catch (error) {
    if (publicId) {
      await cloudinaryService.deleteImage(publicId).catch(() => {});
    }
    throw error;
  }
};

const updateCategory = async (id, data) => {
  const existingCategory = await getCategoryById(id);

  const { imageUrl, publicId, ...categoryData } = data;

  const duplicate = await prisma.category.findFirst({
    where: {
      name: { equals: categoryData.name, mode: "insensitive" },
      id: { not: id },
    },
  });

  if (duplicate) {
    throw new AppError("Ya existe otra categoría con ese nombre", 409);
  }

  try {
    if (publicId && existingCategory.publicId && existingCategory.publicId !== publicId) {
      await cloudinaryService.deleteImage(existingCategory.publicId);
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...categoryData,
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(publicId !== undefined ? { publicId } : {}),
      },
    });

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      publicId: category.publicId,
    };
  } catch (error) {
    if (publicId && publicId !== existingCategory.publicId) {
      await cloudinaryService.deleteImage(publicId).catch(() => {});
    }
    throw error;
  }
};

const deleteCategory = async (id) => {
  const category = await getCategoryById(id);

  if (category.productCount > 0) {
    throw new AppError(
      `No se puede eliminar: la categoría tiene ${category.productCount} producto${category.productCount === 1 ? "" : "s"} asociado${category.productCount === 1 ? "" : "s"}`,
      409
    );
  }

  if (category.publicId) {
    await cloudinaryService.deleteImage(category.publicId).catch(() => {});
  }

  await prisma.category.delete({ where: { id } });
  return { message: "Categoría eliminada" };
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
