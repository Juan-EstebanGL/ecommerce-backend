const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const orderInclude = {
  items: true,
};

const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

const formatOrder = (order) => {
  if (!order) {
    return order;
  }

  return {
    ...order,
    total: Number(order.total),
    items: order.items
      ? order.items.map((item) => ({
          ...item,
          productPrice: Number(item.productPrice),
        }))
      : order.items,
  };
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
      throw new AppError("El carrito esta vacio", 400);
    }

    for (const item of cartItems) {
      if (!item.product) {
        throw new AppError("Producto no encontrado", 404);
      }

      if (item.quantity > item.product.stock) {
        throw new AppError(
          `Stock insuficiente para ${item.product.name}`,
          400
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
        throw new AppError(
          `Stock insuficiente para ${item.product.name}`,
          400
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

    return formatOrder(createdOrder);
  });
};

const getMyOrders = async (userId) => {
  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    include: orderInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map(formatOrder);
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
    throw new AppError("Orden no encontrada", 404);
  }

  if (order.userId !== userId) {
    throw new AppError("No autorizado", 403);
  }

  return formatOrder(order);
};

const updateOrderStatus = async (userId, userRole, orderId, status) => {
  const id = orderId;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: orderInclude,
  });

  if (!order) {
    throw new AppError("Orden no encontrada", 404);
  }

  if (userRole !== "ADMIN" && order.userId !== userId) {
    throw new AppError("No autorizado", 403);
  }

  if (!canTransitionOrderStatus(order.status, status)) {
    throw new AppError("Transicion de estado invalida", 400);
  }

  const updatedOrder = await prisma.order.update({
    where: {
      id,
    },
    data: {
      status,
    },
    include: orderInclude,
  });

  return formatOrder(updatedOrder);
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
