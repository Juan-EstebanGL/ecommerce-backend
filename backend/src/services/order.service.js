const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const orderInclude = {
  items: true,
};

const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const formatOrder = async (order) => {
  if (!order) {
    return order;
  }

  const items = order.items
    ? order.items.map((item) => ({
        ...item,
        productPrice: Number(item.productPrice),
      }))
    : [];

  const missingImageItems = items.filter(
    (item) => !item.imageUrl && item.productId
  );

  if (missingImageItems.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: missingImageItems.map((i) => i.productId) } },
      select: { id: true, imageUrl: true },
    });

    const productMap = new Map(
      products.map((p) => [p.id, p.imageUrl])
    );

    for (const item of items) {
      if (!item.imageUrl && productMap.has(item.productId)) {
        item.imageUrl = productMap.get(item.productId);
      }
    }
  }

  return {
    ...order,
    total: Number(order.total),
    items,
  };
};

const ORDER_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
};

const canTransitionOrderStatus = (currentStatus, nextStatus) => {
  return (ORDER_STATUS_TRANSITIONS[currentStatus] || []).includes(nextStatus);
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
            imageUrl: item.product.imageUrl,
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

const getAllOrders = async () => {
  const orders = await prisma.order.findMany({
    include: {
      ...orderInclude,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Promise.all(orders.map(formatOrder));
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

  return Promise.all(orders.map(formatOrder));
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

  const doUpdate = async (tx) => {
    if (status === ORDER_STATUS.CANCELLED) {
      for (const item of order.items) {
        const updatedProduct = await tx.product.updateMany({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });

        if (updatedProduct.count === 0) {
          throw new AppError("Producto no encontrado para restaurar stock", 404);
        }
      }
    }

    return tx.order.update({
      where: { id },
      data: { status },
      include: orderInclude,
    });
  };

  const updatedOrder = status === ORDER_STATUS.CANCELLED
    ? await prisma.$transaction(doUpdate)
    : await doUpdate(prisma);

  return formatOrder(updatedOrder);
};

const cancelOrder = async (userId, userRole, orderId) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        id: orderId,
      },
      include: orderInclude,
    });

    if (!order) {
      throw new AppError("Orden no encontrada", 404);
    }

    if (userRole !== "ADMIN" && order.userId !== userId) {
      throw new AppError("No autorizado", 403);
    }

    if (order.status !== ORDER_STATUS.PENDING) {
      throw new AppError("Solo se pueden cancelar ordenes pendientes", 400);
    }

    for (const item of order.items) {
      const updatedProduct = await tx.product.updateMany({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });

      if (updatedProduct.count === 0) {
        throw new AppError("Producto no encontrado para restaurar stock", 404);
      }
    }

    const cancelledOrder = await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: ORDER_STATUS.CANCELLED,
      },
      include: orderInclude,
    });

    return formatOrder(cancelledOrder);
  });
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
