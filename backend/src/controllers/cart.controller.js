const cartService = require("../services/cart.service");
const asyncHandler = require("../utils/asyncHandler");
const {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
} = require("../validations/cart.validation");
const { validate } = require("../validations/validation.helper");

const addToCart = asyncHandler(async (req, res) => {
  const data = validate(addToCartSchema, { body: req.body || {} });

  const { cartItem, statusCode } = await cartService.addToCart(
    req.userId,
    data.body
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
  const data = validate(updateCartItemSchema, {
    params: req.params,
    body: req.body || {},
  });

  const updatedCartItem = await cartService.updateCartItem(
    req.userId,
    data.params.id,
    data.body
  );

  return res.json(updatedCartItem);
}, "Error actualizando item del carrito");

const deleteCartItem = asyncHandler(async (req, res) => {
  const data = validate(cartItemParamsSchema, { params: req.params });

  const result = await cartService.deleteCartItem(
    req.userId,
    data.params.id
  );

  return res.json(result);
}, "Error eliminando item del carrito");

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
};