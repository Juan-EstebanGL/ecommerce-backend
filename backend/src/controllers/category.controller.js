const categoryService = require("../services/category.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  categoryParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} = require("../validations/category.validation");
const { getZodErrorMessage } = require("../validations/validation.helper");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories();
  return res.json(categories);
}, "Error obteniendo categorías");

const getCategoryById = asyncHandler(async (req, res) => {
  const validation = categoryParamsSchema.safeParse({ params: req.params });
  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const category = await categoryService.getCategoryById(
    validation.data.params.id
  );
  return res.json(category);
}, "Error obteniendo categoría");

const createCategory = asyncHandler(async (req, res) => {
  const validation = createCategorySchema.safeParse({ body: req.body || {} });
  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const category = await categoryService.createCategory(validation.data.body);
  return res.status(201).json(category);
}, "Error creando categoría");

const updateCategory = asyncHandler(async (req, res) => {
  const validation = updateCategorySchema.safeParse({
    params: req.params,
    body: req.body || {},
  });
  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const category = await categoryService.updateCategory(
    validation.data.params.id,
    validation.data.body
  );
  return res.json(category);
}, "Error actualizando categoría");

const deleteCategory = asyncHandler(async (req, res) => {
  const validation = categoryParamsSchema.safeParse({ params: req.params });
  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const result = await categoryService.deleteCategory(
    validation.data.params.id
  );
  return res.json(result);
}, "Error eliminando categoría");

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
