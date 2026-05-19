const prisma = require("../lib/prisma");

const parsePositiveInteger = (value) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

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

const addToCart = async (req, res) => {
  try {
    const productId = parsePositiveInteger(req.body.productId);
    const quantity = parsePositiveInteger(req.body.quantity);

    if (!productId) {
      return res.status(400).json({
        message: "productId debe ser un entero positivo",
      });
    }

    if (!quantity) {
      return res.status(400).json({
        message: "quantity debe ser un entero mayor a 0",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId,
        },
      },
    });

    const nextQuantity = existingCartItem
      ? existingCartItem.quantity + quantity
      : quantity;

    if (nextQuantity > product.stock) {
      return res.status(400).json({
        message: "Stock insuficiente",
      });
    }

    const cartItem = existingCartItem
      ? await prisma.cartItem.update({
          where: {
            userId_productId: {
              userId: req.userId,
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
            userId: req.userId,
            productId,
            quantity,
          },
          include: cartItemInclude,
        });

    return res.status(existingCartItem ? 200 : 201).json(cartItem);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Error agregando producto al carrito",
    });
  }
};

const getCart = async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: {
        userId: req.userId,
      },
      include: cartItemInclude,
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json({
      items,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Error obteniendo carrito",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const id = parsePositiveInteger(req.params.id);
    const quantity = parsePositiveInteger(req.body.quantity);

    if (!id) {
      return res.status(400).json({
        message: "id debe ser un entero positivo",
      });
    }

    if (!quantity) {
      return res.status(400).json({
        message: "quantity debe ser un entero mayor a 0",
      });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id,
      },
      include: cartItemInclude,
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Item del carrito no encontrado",
      });
    }

    if (cartItem.userId !== req.userId) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({
        message: "Stock insuficiente",
      });
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

    return res.json(updatedCartItem);
  } catch (error) {
    console.log(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Item del carrito no encontrado",
      });
    }

    return res.status(500).json({
      message: "Error actualizando item del carrito",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "id debe ser un entero positivo",
      });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Item del carrito no encontrado",
      });
    }

    if (cartItem.userId !== req.userId) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    await prisma.cartItem.delete({
      where: {
        id,
      },
    });

    return res.json({
      message: "Item eliminado del carrito",
    });
  } catch (error) {
    console.log(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Item del carrito no encontrado",
      });
    }

    return res.status(500).json({
      message: "Error eliminando item del carrito",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
};
