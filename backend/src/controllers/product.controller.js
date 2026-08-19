const productService = require("../services/product.service");
const asyncHandler = require("../utils/asyncHandler");
const {
  createProductSchema,
  updateProductSchema,
  patchProductSchema,
  productParamsSchema,
} = require("../validations/product.validation");
const { validate } = require("../validations/validation.helper");

const createProduct = asyncHandler(async (req, res) => {
  const data = validate(createProductSchema, { body: req.body || {} });

  const product = await productService.createProduct(
    req.userId,
    data.body
  );

  return res.status(201).json(product);
}, "Error creando producto");

const getProducts = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await productService.getProducts({ page, limit });
  return res.json(result);
}, "Error obteniendo productos");

const getProductById = asyncHandler(async (req, res) => {
  const data = validate(productParamsSchema, { params: req.params });

  const product = await productService.getProductById(data.params.id);

  return res.json(product);
}, "Error obteniendo producto");

const updateProduct = asyncHandler(async (req, res) => {
  const data = validate(updateProductSchema, {
    params: req.params,
    body: req.body || {},
  });

  const product = await productService.updateProduct(
    req.userId,
    req.userRole,
    data.params.id,
    data.body
  );

  return res.json(product);
}, "Error actualizando producto");

const patchProduct = asyncHandler(async (req, res) => {
  const data = validate(patchProductSchema, {
    params: req.params,
    body: req.body || {},
  });

  const product = await productService.updateProduct(
    req.userId,
    req.userRole,
    data.params.id,
    data.body
  );

  return res.json(product);
}, "Error actualizando producto");

const deleteProduct = asyncHandler(async (req, res) => {
  const data = validate(productParamsSchema, { params: req.params });

  const result = await productService.deleteProduct(
    req.userId,
    req.userRole,
    data.params.id
  );

  return res.json(result);
}, "Error eliminando producto");

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  patchProduct,
  deleteProduct,
};