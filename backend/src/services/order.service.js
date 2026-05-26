const prisma = require("../lib/prisma");

const orderInclude = {
  items: true,
};

const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

const createServiceError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const canTransitionOrderStatus = (currentStatus, nextStatus) => {
  return (
    currentStatus === ORDER_STATUS.PENDING &&
    (nextStatus === ORDER_STATUS.PAID ||
      nextStatus === ORDER_STATUS.CANCELLED)
  );
};

const createOrder = async (userId) => {
  return prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (cartItems.length === 0) {
      throw createServiceError(400, "El carrito esta vacio");
    }

    for (const item of cartItems) {
      if (!item.product) {
        throw createServiceError(404, "Producto no encontrado");
      }

      if (item.quantity > item.product.stock) {
        throw createServiceError(
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
        throw createServiceError(
          400,
          `Stock insuficiente para ${item.product.name}`
        );
      }
    }

    const createdOrder = await tx.order.create({
      data: {
        total,
        status: ORDER_STATUS.PENDING,
        userId,
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
        userId,
      },
    });

    return createdOrder;
  });
};

const getMyOrders = async (userId) => {
  return prisma.order.findMany({
    where: {
      userId,
    },
    include: orderInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getOrderById = async (userId, orderId) => {
  const id = orderId;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: orderInclude,
  });

  if (!order) {
    throw createServiceError(404, "Orden no encontrada");
  }

  if (order.userId !== userId) {
    throw createServiceError(403, "No autorizado");
  }

  return order;
};

const updateOrderStatus = async (userId, orderId, status) => {
  const id = orderId;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: orderInclude,
  });

  if (!order) {
    throw createServiceError(404, "Orden no encontrada");
  }

  if (order.userId !== userId) {
    throw createServiceError(403, "No autorizado");
  }

  if (!canTransitionOrderStatus(order.status, status)) {
    throw createServiceError(400, "Transicion de estado invalida");
  }

  return prisma.order.update({
    where: {
      id,
    },
    data: {
      status,
    },
    include: orderInclude,
  });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
