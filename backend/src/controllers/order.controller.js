const prisma = require("../lib/prisma");

const parsePositiveInteger = (value) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

const orderInclude = {
  items: true,
};

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createOrder = async (req, res) => {
  try {
    const order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: {
          userId: req.userId,
        },
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (cartItems.length === 0) {
        throw createHttpError(400, "El carrito esta vacio");
      }

      for (const item of cartItems) {
        if (!item.product) {
          throw createHttpError(404, "Producto no encontrado");
        }

        if (item.quantity > item.product.stock) {
          throw createHttpError(
            400,
            `Stock insuficiente para ${item.product.name}`
          );
        }
      }

      const total = cartItems.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);

      for (const item of cartItems) {
        const updatedProduct = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedProduct.count === 0) {
          throw createHttpError(
            400,
            `Stock insuficiente para ${item.product.name}`
          );
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          total,
          userId: req.userId,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productPrice: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: orderInclude,
      });

      await tx.cartItem.deleteMany({
        where: {
          userId: req.userId,
        },
      });

      return createdOrder;
    });

    return res.status(201).json({
      message: "Orden creada correctamente",
      order,
    });
  } catch (error) {
    console.log(error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error creando orden",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.userId,
      },
      include: orderInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      orders,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Error obteniendo ordenes",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const id = parsePositiveInteger(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "id debe ser un entero positivo",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: orderInclude,
    });

    if (!order) {
      return res.status(404).json({
        message: "Orden no encontrada",
      });
    }

    if (order.userId !== req.userId) {
      return res.status(403).json({
        message: "No autorizado",
      });
    }

    return res.json({
      order,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Error obteniendo orden",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
