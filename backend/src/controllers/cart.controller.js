const cartService = require("../services/cart.service");

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

const addToCart = async (req, res) => {
  try {
    const { cartItem, statusCode } = await cartService.addToCart(
      req.userId,
      req.body
    );

    return res.status(statusCode).json(cartItem);
  } catch (error) {
    return handleError(res, error, "Error agregando producto al carrito");
  }
};

const getCart = async (req, res) => {
  try {
    const items = await cartService.getCart(req.userId);

    return res.json({
      items,
    });
  } catch (error) {
    return handleError(res, error, "Error obteniendo carrito");
  }
};

const updateCartItem = async (req, res) => {
  try {
    const updatedCartItem = await cartService.updateCartItem(
      req.userId,
      req.params.id,
      req.body
    );

    return res.json(updatedCartItem);
  } catch (error) {
    return handleError(res, error, "Error actualizando item del carrito");
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const result = await cartService.deleteCartItem(
      req.userId,
      req.params.id
    );

    return res.json(result);
  } catch (error) {
    return handleError(res, error, "Error eliminando item del carrito");
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
};
