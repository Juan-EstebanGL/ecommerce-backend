const userService = require("../services/user.service");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  return res.json(users);
}, "Error obteniendo usuarios");

const updateUserRole = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  if (isNaN(targetId)) throw new AppError("ID inválido", 400);

  const { role } = req.body || {};
  if (!role) throw new AppError("El campo role es requerido", 400);

  const updated = await userService.updateUserRole(req.userId, targetId, role);
  return res.json(updated);
}, "Error actualizando rol");

const deleteUser = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  if (isNaN(targetId)) throw new AppError("ID inválido", 400);

  const result = await userService.deleteUser(req.userId, targetId);
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
  const { firstName, lastName, email, phone } = req.body || {};

  if (email !== undefined && email !== null) {
    if (typeof email !== "string" || !email.trim()) {
      throw new AppError("El correo electrónico no puede estar vacío", 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new AppError("El formato del correo electrónico no es válido", 400);
    }
  }

  const updated = await userService.updateProfile(req.userId, {
    firstName,
    lastName,
    email: email ? email.trim() : email,
    phone,
  });

  return res.json(updated);
}, "Error actualizando perfil");

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    throw new AppError("Todos los campos son requeridos", 400);
  }

  if (newPassword.length < 8) {
    throw new AppError("La nueva contraseña debe tener al menos 8 caracteres", 400);
  }

  const result = await userService.changePassword(req.userId, {
    currentPassword,
    newPassword,
  });

  return res.json(result);
}, "Error cambiando contraseña");

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await userService.getAddresses(req.userId);
  return res.json(addresses);
}, "Error obteniendo direcciones");

const createAddress = asyncHandler(async (req, res) => {
  const { label, recipient, phone, street, city, state, postalCode, instructions, isDefault } = req.body || {};

  if (!label || !label.trim()) throw new AppError("El nombre de la dirección es requerido", 400);
  if (!recipient || !recipient.trim()) throw new AppError("El destinatario es requerido", 400);
  if (!street || !street.trim()) throw new AppError("La dirección es requerida", 400);
  if (!city || !city.trim()) throw new AppError("La ciudad es requerida", 400);
  if (!state || !state.trim()) throw new AppError("El departamento es requerido", 400);

  const address = await userService.createAddress(req.userId, {
    label: label.trim(),
    recipient: recipient.trim(),
    phone: phone?.trim() || null,
    street: street.trim(),
    city: city.trim(),
    state: state.trim(),
    postalCode: postalCode?.trim() || null,
    instructions: instructions?.trim() || null,
    isDefault: !!isDefault,
  });

  return res.status(201).json(address);
}, "Error creando dirección");

const updateAddress = asyncHandler(async (req, res) => {
  const addressId = parseInt(req.params.id, 10);
  if (isNaN(addressId)) throw new AppError("ID inválido", 400);

  const { label, recipient, phone, street, city, state, postalCode, instructions, isDefault } = req.body || {};

  const updated = await userService.updateAddress(req.userId, addressId, {
    label: label?.trim(),
    recipient: recipient?.trim(),
    phone: phone?.trim(),
    street: street?.trim(),
    city: city?.trim(),
    state: state?.trim(),
    postalCode: postalCode?.trim(),
    instructions: instructions?.trim(),
    isDefault,
  });

  return res.json(updated);
}, "Error actualizando dirección");

const deleteAddress = asyncHandler(async (req, res) => {
  const addressId = parseInt(req.params.id, 10);
  if (isNaN(addressId)) throw new AppError("ID inválido", 400);

  const result = await userService.deleteAddress(req.userId, addressId);
  return res.json(result);
}, "Error eliminando dirección");

const setDefaultAddress = asyncHandler(async (req, res) => {
  const addressId = parseInt(req.params.id, 10);
  if (isNaN(addressId)) throw new AppError("ID inválido", 400);

  const updated = await userService.setDefaultAddress(req.userId, addressId);
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
