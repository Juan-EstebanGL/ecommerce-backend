const prisma = require("../lib/prisma");

const productSelect = {
  id: true,
  name: true,
  price: true,
  stock: true,
};

const cartItemInclude = {
  product: {
    select: productSelect,
  },
};

const createServiceError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const addToCart = async (userId, payload) => {
  const { productId, quantity } = payload;

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw createServiceError(404, "Producto no encontrado");
  }

  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  const nextQuantity = existingCartItem
    ? existingCartItem.quantity + quantity
    : quantity;

  if (nextQuantity > product.stock) {
    throw createServiceError(400, "Stock insuficiente");
  }

  const cartItem = existingCartItem
    ? await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        data: {
          quantity: {
            increment: quantity,
          },
        },
        include: cartItemInclude,
      })
    : await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: cartItemInclude,
      });

  return {
    cartItem,
    statusCode: existingCartItem ? 200 : 201,
  };
};

const getCart = async (userId) => {
  return prisma.cartItem.findMany({
    where: {
      userId,
    },
    include: cartItemInclude,
    orderBy: {
      createdAt: "asc",
    },
  });
};

const updateCartItem = async (userId, cartItemId, payload) => {
  const id = cartItemId;
  const { quantity } = payload;

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      id,
    },
    include: cartItemInclude,
  });

  if (!cartItem) {
    throw createServiceError(404, "Item del carrito no encontrado");
  }

  if (cartItem.userId !== userId) {
    throw createServiceError(403, "No autorizado");
  }

  if (quantity > cartItem.product.stock) {
    throw createServiceError(400, "Stock insuficiente");
  }

  try {
    return await prisma.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
      include: cartItemInclude,
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw createServiceError(404, "Item del carrito no encontrado");
    }

    throw error;
  }
};

const deleteCartItem = async (userId, cartItemId) => {
  const id = cartItemId;

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      id,
    },
  });

  if (!cartItem) {
    throw createServiceError(404, "Item del carrito no encontrado");
  }

  if (cartItem.userId !== userId) {
    throw createServiceError(403, "No autorizado");
  }

  try {
    await prisma.cartItem.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw createServiceError(404, "Item del carrito no encontrado");
    }

    throw error;
  }

  return {
    message: "Item eliminado del carrito",
  };
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
};
