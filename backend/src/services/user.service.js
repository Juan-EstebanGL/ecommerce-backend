const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const VALID_ROLES = ["USER", "ADMIN"];

const getUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return users;
};

const getById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError("Usuario no encontrado", 404);

  return user;
};

const updateUserRole = async (authenticatedUserId, targetUserId, newRole) => {
  if (!VALID_ROLES.includes(newRole)) {
    throw new AppError("Rol inválido. Debe ser USER o ADMIN", 400);
  }

  const targetUser = await getById(targetUserId);

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return updated;
};

const deleteUser = async (authenticatedUserId, targetUserId) => {
  if (authenticatedUserId === targetUserId) {
    throw new AppError("No puedes eliminar tu propia cuenta", 403);
  }

  const targetUser = await getById(targetUserId);

  if (targetUser.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount <= 1) {
      throw new AppError("Debe existir al menos un administrador", 409);
    }
  }

  try {
    await prisma.user.delete({ where: { id: targetUserId } });
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("Usuario no encontrado", 404);
    }
    throw error;
  }

  return { message: "Usuario eliminado correctamente" };
};

module.exports = { getUsers, updateUserRole, deleteUser };
