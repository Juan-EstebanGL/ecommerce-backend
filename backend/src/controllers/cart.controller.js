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
          include: {
            product: {
              select: productSelect,
            },
          },
        })
      : await prisma.cartItem.create({
          data: {
            userId: req.userId,
            productId,
            quantity,
          },
          include: {
            product: {
              select: productSelect,
            },
          },
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
      include: {
        product: {
          select: productSelect,
        },
      },
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

module.exports = {
  addToCart,
  getCart,
};
