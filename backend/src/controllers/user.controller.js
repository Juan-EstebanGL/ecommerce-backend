const userService = require("../services/user.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  userIdParamsSchema,
  updateUserRoleSchema,
  updateProfileSchema,
  changePasswordSchema,
  createAddressSchema,
  updateAddressSchema,
} = require("../validations/user.validation");
const { validate } = require("../validations/validation.helper");

const getUsers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await userService.getUsers({ page, limit });
  return res.json(result);
}, "Error obteniendo usuarios");

const updateUserRole = asyncHandler(async (req, res) => {
  const data = validate(updateUserRoleSchema, {
    params: req.params,
    body: req.body || {},
  });

  const updated = await userService.updateUserRole(
    data.params.id,
    data.body.role
  );
  return res.json(updated);
}, "Error actualizando rol");

const deleteUser = asyncHandler(async (req, res) => {
  const data = validate(userIdParamsSchema, { params: req.params });

  const result = await userService.deleteUser(req.userId, data.params.id);
  return res.json(result);
}, "Error eliminando usuario");

const getMyStats = asyncHandler(async (req, res) => {
  const stats = await userService.getMyStats(req.userId);
  return res.json(stats);
}, "Error obteniendo estadísticas del usuario");

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No se proporcionó ninguna imagen", 400);
  }

  const user = await userService.updateAvatar(req.userId, req.file);
  return res.json(user);
}, "Error actualizando avatar");

const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await userService.deleteAvatar(req.userId);
  return res.json(user);
}, "Error eliminando avatar");

const updateProfile = asyncHandler(async (req, res) => {
  const data = validate(updateProfileSchema, { body: req.body || {} });

  const updated = await userService.updateProfile(req.userId, {
    firstName: data.body.firstName,
    lastName: data.body.lastName,
    email: data.body.email ? data.body.email.toLowerCase() : data.body.email,
    phone: data.body.phone,
  });

  return res.json(updated);
}, "Error actualizando perfil");

const changePassword = asyncHandler(async (req, res) => {
  const data = validate(changePasswordSchema, { body: req.body || {} });

  const result = await userService.changePassword(req.userId, {
    currentPassword: data.body.currentPassword,
    newPassword: data.body.newPassword,
  });

  return res.json(result);
}, "Error cambiando contraseña");

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await userService.getAddresses(req.userId);
  return res.json(addresses);
}, "Error obteniendo direcciones");

const createAddress = asyncHandler(async (req, res) => {
  const data = validate(createAddressSchema, { body: req.body || {} });

  const address = await userService.createAddress(req.userId, {
    label: data.body.label,
    recipient: data.body.recipient,
    phone: data.body.phone || null,
    street: data.body.street,
    city: data.body.city,
    state: data.body.state,
    postalCode: data.body.postalCode || null,
    instructions: data.body.instructions || null,
    isDefault: !!data.body.isDefault,
  });

  return res.status(201).json(address);
}, "Error creando dirección");

const updateAddress = asyncHandler(async (req, res) => {
  const data = validate(updateAddressSchema, {
    params: req.params,
    body: req.body || {},
  });

  const updated = await userService.updateAddress(req.userId, data.params.id, {
    label: data.body.label,
    recipient: data.body.recipient,
    phone: data.body.phone,
    street: data.body.street,
    city: data.body.city,
    state: data.body.state,
    postalCode: data.body.postalCode,
    instructions: data.body.instructions,
    isDefault: data.body.isDefault,
  });

  return res.json(updated);
}, "Error actualizando dirección");

const deleteAddress = asyncHandler(async (req, res) => {
  const data = validate(userIdParamsSchema, { params: req.params });

  const result = await userService.deleteAddress(req.userId, data.params.id);
  return res.json(result);
}, "Error eliminando dirección");

const setDefaultAddress = asyncHandler(async (req, res) => {
  const data = validate(userIdParamsSchema, { params: req.params });

  const updated = await userService.setDefaultAddress(req.userId, data.params.id);
  return res.json(updated);
}, "Error cambiando dirección predeterminada");

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  getMyStats,
  updateAvatar,
  deleteAvatar,
  updateProfile,
  changePassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};