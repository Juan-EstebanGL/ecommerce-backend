const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { productListItemSelect, formatProductListItem } = require("../utils/productListItem");

const cartItemInclude = {
  product: {
    select: productListItemSelect,
  },
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
    cartItem: formatProductListItem(cartItem),
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

  return items.map(formatProductListItem);
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

  const updatedCartItem = await prisma.cartItem.update({
    where: {
      id,
    },
    data: {
      quantity,
    },
    include: cartItemInclude,
  });

  return formatProductListItem(updatedCartItem);
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

  await prisma.cartItem.delete({
    where: {
      id,
    },
  });

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
