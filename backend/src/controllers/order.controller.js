const orderService = require("../services/order.service");
const {
  orderIdParamsSchema,
  updateOrderStatusSchema,
} = require("../validations/order.validation");
const {
  getZodErrorMessage,
} = require("../validations/validation.helper");

const handleError = (res, error, fallbackMessage) => {
  console.log(error);

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: fallbackMessage,
  });
};

const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.userId);

    return res.status(201).json({
      message: "Orden creada correctamente",
      order,
    });
  } catch (error) {
    return handleError(res, error, "Error creando orden");
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getMyOrders(req.userId);

    return res.json({
      orders,
    });
  } catch (error) {
    return handleError(res, error, "Error obteniendo ordenes");
  }
};

const getOrderById = async (req, res) => {
  try {
    const validation = orderIdParamsSchema.safeParse({
      params: req.params,
    });

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const order = await orderService.getOrderById(
      req.userId,
      validation.data.params.id
    );

    return res.json({
      order,
    });
  } catch (error) {
    return handleError(res, error, "Error obteniendo orden");
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const validation = updateOrderStatusSchema.safeParse({
      params: req.params,
      body: req.body || {},
    });

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const order = await orderService.updateOrderStatus(
      req.userId,
      validation.data.params.id,
      validation.data.body.status
    );

    return res.json({
      message: "Estado de orden actualizado",
      order,
    });
  } catch (error) {
    return handleError(res, error, "Error actualizando estado de orden");
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
