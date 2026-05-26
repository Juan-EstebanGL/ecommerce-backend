const orderService = require("../services/order.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  orderIdParamsSchema,
  updateOrderStatusSchema,
} = require("../validations/order.validation");
const {
  getZodErrorMessage,
} = require("../validations/validation.helper");

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.userId);

  return res.status(201).json({
    message: "Orden creada correctamente",
    order,
  });
}, "Error creando orden");

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.userId);

  return res.json({
    orders,
  });
}, "Error obteniendo ordenes");

const getOrderById = asyncHandler(async (req, res) => {
  const validation = orderIdParamsSchema.safeParse({
    params: req.params,
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const order = await orderService.getOrderById(
    req.userId,
    validation.data.params.id
  );

  return res.json({
    order,
  });
}, "Error obteniendo orden");

const updateOrderStatus = asyncHandler(async (req, res) => {
  const validation = updateOrderStatusSchema.safeParse({
    params: req.params,
    body: req.body || {},
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const order = await orderService.updateOrderStatus(
    req.userId,
    req.userRole,
    validation.data.params.id,
    validation.data.body.status
  );

  return res.json({
    message: "Estado de orden actualizado",
    order,
  });
}, "Error actualizando estado de orden");

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
