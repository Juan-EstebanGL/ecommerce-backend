const cartService = require("../services/cart.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
} = require("../validations/cart.validation");
const {
  getZodErrorMessage,
} = require("../validations/validation.helper");

const addToCart = asyncHandler(async (req, res) => {
  const validation = addToCartSchema.safeParse({
    body: req.body || {},
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { cartItem, statusCode } = await cartService.addToCart(
    req.userId,
    validation.data.body
  );

  return res.status(statusCode).json(cartItem);
}, "Error agregando producto al carrito");

const getCart = asyncHandler(async (req, res) => {
  const items = await cartService.getCart(req.userId);

  return res.json({
    items,
  });
}, "Error obteniendo carrito");

const updateCartItem = asyncHandler(async (req, res) => {
  const validation = updateCartItemSchema.safeParse({
    params: req.params,
    body: req.body || {},
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const updatedCartItem = await cartService.updateCartItem(
    req.userId,
    validation.data.params.id,
    validation.data.body
  );

  return res.json(updatedCartItem);
}, "Error actualizando item del carrito");

const deleteCartItem = asyncHandler(async (req, res) => {
  const validation = cartItemParamsSchema.safeParse({
    params: req.params,
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const result = await cartService.deleteCartItem(
    req.userId,
    validation.data.params.id
  );

  return res.json(result);
}, "Error eliminando item del carrito");

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
};
