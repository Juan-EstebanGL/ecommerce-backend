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
  const favorites = await favoriteService.getFavorites(req.userId);

  return res.json(favorites);
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

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
