const favoriteService = require("../services/favorite.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  favoriteParamsSchema,
} = require("../validations/favorite.validation");
const {
  getZodErrorMessage,
} = require("../validations/validation.helper");

const getFavorites = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await favoriteService.getFavorites(req.userId, { page, limit });
  return res.json(result);
}, "Error obteniendo favoritos");

const addFavorite = asyncHandler(async (req, res) => {
  const validation = favoriteParamsSchema.safeParse({
    params: req.params,
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const favorite = await favoriteService.addFavorite(
    req.userId,
    validation.data.params.productId
  );

  return res.status(201).json(favorite);
}, "Error agregando favorito");

const removeFavorite = asyncHandler(async (req, res) => {
  const validation = favoriteParamsSchema.safeParse({
    params: req.params,
  });

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  await favoriteService.removeFavorite(
    req.userId,
    validation.data.params.productId
  );

  return res.status(204).send();
}, "Error eliminando favorito");

const getAdminFavorites = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const stats = await favoriteService.getAdminFavoritesStats({ page, limit });
  return res.json(stats);
}, "Error obteniendo estadísticas de favoritos");

module.exports = {
  getFavorites,
  getAdminFavorites,
  addFavorite,
  removeFavorite,
};
