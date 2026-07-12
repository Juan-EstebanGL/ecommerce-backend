const prisma = require("../lib/prisma");
const cloudinary = require("../config/cloudinary");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");

const VALID_ROLES = ["USER", "ADMIN"];

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  avatarUrl: true,
  createdAt: true,
};

const ADDRESS_SELECT = {
  id: true,
  label: true,
  recipient: true,
  phone: true,
  street: true,
  city: true,
  state: true,
  postalCode: true,
  instructions: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
};

const getUsers = async ({ page = 1, limit = 8 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 8));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: USER_SELECT,
      skip,
      take: limitNum,
    }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

const getById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: USER_SELECT,
  });

  if (!user) throw new AppError("Usuario no encontrado", 404);

  return user;
};

const updateUserRole = async (authenticatedUserId, targetUserId, newRole) => {
  if (!VALID_ROLES.includes(newRole)) {
    throw new AppError("Rol inválido. Debe ser USER o ADMIN", 400);
  }

  await getById(targetUserId);

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
    select: USER_SELECT,
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

const getMyStats = async (userId) => {
  const [ordersCount, favoritesCount, reviewsCount] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.review.count({ where: { userId } }),
  ]);

  return { orders: ordersCount, favorites: favoritesCount, reviews: reviewsCount };
};

const updateAvatar = async (userId, file) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPublicId: true },
  });

  if (!user) throw new AppError("Usuario no encontrado", 404);

  if (user.avatarPublicId) {
    try {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    } catch (err) {
      console.error("[avatar] Error eliminando imagen anterior:", err.message);
    }
  }

  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "ecommerce/avatars",
    resource_type: "image",
  });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl: result.secure_url,
      avatarPublicId: result.public_id,
    },
    select: USER_SELECT,
  });

  return updated;
};

const deleteAvatar = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPublicId: true },
  });

  if (!user) throw new AppError("Usuario no encontrado", 404);

  if (user.avatarPublicId) {
    try {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    } catch (err) {
      console.error("[avatar] Error eliminando imagen de Cloudinary:", err.message);
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl: null,
      avatarPublicId: null,
    },
    select: USER_SELECT,
  });

  return updated;
};

const updateProfile = async (userId, { firstName, lastName, email, phone }) => {
  if (email) {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing && existing.id !== userId) {
      throw new AppError("El correo electrónico ya está en uso", 409);
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: firstName !== undefined ? firstName : undefined,
      lastName: lastName !== undefined ? lastName : undefined,
      email: email || undefined,
      phone: phone !== undefined ? phone : undefined,
    },
    select: USER_SELECT,
  });

  return updated;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) throw new AppError("Usuario no encontrado", 404);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("La contraseña actual es incorrecta", 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Contraseña actualizada correctamente" };
};

const getAddresses = async (userId) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: ADDRESS_SELECT,
  });

  return addresses;
};

const createAddress = async (userId, data) => {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      label: data.label,
      recipient: data.recipient,
      phone: data.phone || null,
      street: data.street,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode || null,
      instructions: data.instructions || null,
      isDefault: data.isDefault || false,
    },
    select: ADDRESS_SELECT,
  });

  return address;
};

const updateAddress = async (userId, addressId, data) => {
  const existing = await prisma.address.findUnique({
    where: { id: addressId },
    select: { userId: true },
  });

  if (!existing) throw new AppError("Dirección no encontrada", 404);
  if (existing.userId !== userId) throw new AppError("No autorizado", 403);

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id: addressId },
    data: {
      label: data.label !== undefined ? data.label : undefined,
      recipient: data.recipient !== undefined ? data.recipient : undefined,
      phone: data.phone !== undefined ? data.phone : undefined,
      street: data.street !== undefined ? data.street : undefined,
      city: data.city !== undefined ? data.city : undefined,
      state: data.state !== undefined ? data.state : undefined,
      postalCode: data.postalCode !== undefined ? data.postalCode : undefined,
      instructions: data.instructions !== undefined ? data.instructions : undefined,
      isDefault: data.isDefault !== undefined ? data.isDefault : undefined,
    },
    select: ADDRESS_SELECT,
  });

  return updated;
};

const deleteAddress = async (userId, addressId) => {
  const existing = await prisma.address.findUnique({
    where: { id: addressId },
    select: { userId: true },
  });

  if (!existing) throw new AppError("Dirección no encontrada", 404);
  if (existing.userId !== userId) throw new AppError("No autorizado", 403);

  try {
    await prisma.address.delete({ where: { id: addressId } });
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("Dirección no encontrada", 404);
    }
    throw error;
  }

  return { message: "Dirección eliminada correctamente" };
};

const setDefaultAddress = async (userId, addressId) => {
  const existing = await prisma.address.findUnique({
    where: { id: addressId },
    select: { userId: true },
  });

  if (!existing) throw new AppError("Dirección no encontrada", 404);
  if (existing.userId !== userId) throw new AppError("No autorizado", 403);

  await prisma.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });

  const updated = await prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
    select: ADDRESS_SELECT,
  });

  return updated;
};

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
