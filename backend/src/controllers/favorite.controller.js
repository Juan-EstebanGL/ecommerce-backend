const favoriteService = require("../services/favorite.service");
const asyncHandler = require("../utils/asyncHandler");
const {
  favoriteParamsSchema,
} = require("../validations/favorite.validation");
const { validate } = require("../validations/validation.helper");

const getFavorites = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await favoriteService.getFavorites(req.userId, { page, limit });
  return res.json(result);
}, "Error obteniendo favoritos");

const addFavorite = asyncHandler(async (req, res) => {
  const data = validate(favoriteParamsSchema, { params: req.params });

  const favorite = await favoriteService.addFavorite(
    req.userId,
    data.params.productId
  );

  return res.status(201).json(favorite);
}, "Error agregando favorito");

const removeFavorite = asyncHandler(async (req, res) => {
  const data = validate(favoriteParamsSchema, { params: req.params });

  await favoriteService.removeFavorite(
    req.userId,
    data.params.productId
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