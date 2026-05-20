const cartService = require("../services/cart.service");
const {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
} = require("../validations/cart.validation");
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

const addToCart = async (req, res) => {
  try {
    const validation = addToCartSchema.safeParse({
      body: req.body || {},
    });

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const { cartItem, statusCode } = await cartService.addToCart(
      req.userId,
      validation.data.body
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
    const validation = updateCartItemSchema.safeParse({
      params: req.params,
      body: req.body || {},
    });

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const updatedCartItem = await cartService.updateCartItem(
      req.userId,
      validation.data.params.id,
      validation.data.body
    );

    return res.json(updatedCartItem);
  } catch (error) {
    return handleError(res, error, "Error actualizando item del carrito");
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const validation = cartItemParamsSchema.safeParse({
      params: req.params,
    });

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const result = await cartService.deleteCartItem(
      req.userId,
      validation.data.params.id
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
