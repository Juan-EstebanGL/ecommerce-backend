const orderService = require("../services/order.service");

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
    const order = await orderService.getOrderById(
      req.userId,
      req.params.id
    );

    return res.json({
      order,
    });
  } catch (error) {
    return handleError(res, error, "Error obteniendo orden");
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
