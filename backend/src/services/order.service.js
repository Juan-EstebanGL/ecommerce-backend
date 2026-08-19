const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { paginate } = require("../utils/pagination");
const { ORDER_STATUS } = require("../constants/order");

const orderInclude = {
  items: true,
};

const restoreStock = async (tx, items) => {
  for (const item of items) {
    const updatedProduct = await tx.product.updateMany({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });

    if (updatedProduct.count === 0) {
      throw new AppError("Producto no encontrado para restaurar stock", 404);
    }
  }
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

const formatOrders = async (orders) => {
  const missingImageItems = orders.flatMap((order) =>
    order.items
      ? order.items.filter((item) => !item.imageUrl && item.productId)
      : []
  );

  const missingProductIds = [...new Set(missingImageItems.map((i) => i.productId))];

  const productMap = new Map();

  if (missingProductIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: missingProductIds } },
      select: { id: true, imageUrl: true },
    });

    for (const product of products) {
      productMap.set(product.id, product.imageUrl);
    }
  }

  return orders.map((order) => {
    const items = order.items
      ? order.items.map((item) => {
          const imageUrl = item.imageUrl || productMap.get(item.productId) || null;

          return {
            ...item,
            productPrice: Number(item.productPrice),
            ...(imageUrl ? { imageUrl } : {}),
          };
        })
      : [];

    return {
      ...order,
      total: Number(order.total),
      items,
    };
  });
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

const createOrder = async (userId, { addressId } = {}) => {
  return prisma.$transaction(async (tx) => {
    if (addressId) {
      const address = await tx.address.findUnique({
        where: { id: addressId },
        select: { userId: true },
      });

      if (!address || address.userId !== userId) {
        throw new AppError("Dirección no válida", 400);
      }
    }

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
        addressId: addressId || null,
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

const getAllOrders = async ({ page = 1, limit = 8 } = {}) => {
  const { pageNum, limitNum, skip } = paginate(page, limit, 8);

  const [orders, total, totalPending, totalDelivered, totalCancelled] = await Promise.all([
    prisma.order.findMany({
      include: {
        ...orderInclude,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limitNum,
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: ORDER_STATUS.PENDING } }),
    prisma.order.count({ where: { status: ORDER_STATUS.DELIVERED } }),
    prisma.order.count({ where: { status: ORDER_STATUS.CANCELLED } }),
  ]);

  return {
    data: await formatOrders(orders),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    stats: {
      totalPending,
      totalDelivered,
      totalCancelled,
    },
  };
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

  return formatOrders(orders);
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
      await restoreStock(tx, order.items);
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

    await restoreStock(tx, order.items);

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
