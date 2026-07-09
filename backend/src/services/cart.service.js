const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const productSelect = {
  id: true,
  name: true,
  price: true,
  stock: true,
  imageUrl: true,
};

const cartItemInclude = {
  product: {
    select: productSelect,
  },
};

const formatCartItem = (cartItem) => {
  if (!cartItem) {
    return cartItem;
  }

  return {
    ...cartItem,
    product: cartItem.product
      ? {
          ...cartItem.product,
          price: Number(cartItem.product.price),
        }
      : cartItem.product,
  };
};

const addToCart = async (userId, payload) => {
  const { productId, quantity } = payload;

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("Producto no encontrado", 404);
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
    throw new AppError("Stock insuficiente", 400);
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
    cartItem: formatCartItem(cartItem),
    statusCode: existingCartItem ? 200 : 201,
  };
};

const getCart = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: {
      userId,
    },
    include: cartItemInclude,
    orderBy: {
      createdAt: "asc",
    },
  });

  return items.map(formatCartItem);
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
    throw new AppError("Item del carrito no encontrado", 404);
  }

  if (cartItem.userId !== userId) {
    throw new AppError("No autorizado", 403);
  }

  if (quantity > cartItem.product.stock) {
    throw new AppError("Stock insuficiente", 400);
  }

  try {
    const updatedCartItem = await prisma.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
      include: cartItemInclude,
    });

    return formatCartItem(updatedCartItem);
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("Item del carrito no encontrado", 404);
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
    throw new AppError("Item del carrito no encontrado", 404);
  }

  if (cartItem.userId !== userId) {
    throw new AppError("No autorizado", 403);
  }

  try {
    await prisma.cartItem.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("Item del carrito no encontrado", 404);
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
