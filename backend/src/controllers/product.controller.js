const productService = require("../services/product.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  createProductSchema,
  updateProductSchema,
  patchProductSchema,
  productParamsSchema,
} = require("../validations/product.validation");
const {
  getZodErrorMessage,
} = require("../validations/validation.helper");

const createProduct = asyncHandler(async (req, res) => {
  const validation = createProductSchema.safeParse({
    body: req.body || {},
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const product = await productService.createProduct(
    req.userId,
    validation.data.body
  );

  return res.status(201).json(product);
}, "Error creando producto");

const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getProducts();

  return res.json(products);
}, "Error obteniendo productos");

const updateProduct = asyncHandler(async (req, res) => {
  const validation = updateProductSchema.safeParse({
    params: req.params,
    body: req.body || {},
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const product = await productService.updateProduct(
    req.userId,
    req.userRole,
    validation.data.params.id,
    validation.data.body
  );

  return res.json(product);
}, "Error actualizando producto");

const patchProduct = asyncHandler(async (req, res) => {
  const validation = patchProductSchema.safeParse({
    params: req.params,
    body: req.body || {},
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const product = await productService.patchProduct(
    req.userId,
    req.userRole,
    validation.data.params.id,
    validation.data.body
  );

  return res.json(product);
}, "Error actualizando producto");

const deleteProduct = asyncHandler(async (req, res) => {
  const validation = productParamsSchema.safeParse({
    params: req.params,
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const result = await productService.deleteProduct(
    req.userId,
    req.userRole,
    validation.data.params.id
  );

  return res.json(result);
}, "Error eliminando producto");

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  patchProduct,
  deleteProduct,
};
