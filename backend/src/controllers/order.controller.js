const orderService = require("../services/order.service");
const asyncHandler = require("../utils/asyncHandler");
const {
  orderIdParamsSchema,
  createOrderSchema,
  updateOrderStatusSchema,
} = require("../validations/order.validation");
const { validate } = require("../validations/validation.helper");

const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await orderService.getAllOrders({ page, limit });
  return res.json({
    orders: result.data,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    stats: result.stats,
  });
}, "Error obteniendo todas las ordenes");

const createOrder = asyncHandler(async (req, res) => {
  const data = validate(createOrderSchema, { body: req.body || {} });

  const order = await orderService.createOrder(req.userId, {
    addressId: data.body.addressId || null,
  });

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
  const data = validate(orderIdParamsSchema, { params: req.params });

  const order = await orderService.getOrderById(
    req.userId,
    data.params.id
  );

  return res.json({
    order,
  });
}, "Error obteniendo orden");

const updateOrderStatus = asyncHandler(async (req, res) => {
  const data = validate(updateOrderStatusSchema, {
    params: req.params,
    body: req.body || {},
  });

  const order = await orderService.updateOrderStatus(
    req.userId,
    req.userRole,
    data.params.id,
    data.body.status
  );

  return res.json({
    message: "Estado de orden actualizado",
    order,
  });
}, "Error actualizando estado de orden");

const cancelOrder = asyncHandler(async (req, res) => {
  const data = validate(orderIdParamsSchema, { params: req.params });

  const order = await orderService.cancelOrder(
    req.userId,
    req.userRole,
    data.params.id
  );

  return res.json({
    message: "Orden cancelada correctamente",
    order,
  });
}, "Error cancelando orden");

module.exports = {
  getAllOrders,
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};