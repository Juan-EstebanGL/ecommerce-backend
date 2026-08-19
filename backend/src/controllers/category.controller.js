const categoryService = require("../services/category.service");
const asyncHandler = require("../utils/asyncHandler");
const {
  categoryParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} = require("../validations/category.validation");
const { validate } = require("../validations/validation.helper");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories();
  return res.json(categories);
}, "Error obteniendo categorías");

const getCategoryById = asyncHandler(async (req, res) => {
  const data = validate(categoryParamsSchema, { params: req.params });

  const category = await categoryService.getCategoryById(data.params.id);
  return res.json(category);
}, "Error obteniendo categoría");

const createCategory = asyncHandler(async (req, res) => {
  const data = validate(createCategorySchema, { body: req.body || {} });

  const category = await categoryService.createCategory(data.body);
  return res.status(201).json(category);
}, "Error creando categoría");

const updateCategory = asyncHandler(async (req, res) => {
  const data = validate(updateCategorySchema, {
    params: req.params,
    body: req.body || {},
  });

  const category = await categoryService.updateCategory(
    data.params.id,
    data.body
  );
  return res.json(category);
}, "Error actualizando categoría");

const deleteCategory = asyncHandler(async (req, res) => {
  const data = validate(categoryParamsSchema, { params: req.params });

  const result = await categoryService.deleteCategory(data.params.id);
  return res.json(result);
}, "Error eliminando categoría");

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};