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

module.exports = { getUsers, updateUserRole, deleteUser };
