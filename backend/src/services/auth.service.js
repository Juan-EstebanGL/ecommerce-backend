const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const env = require("../config/env");
const { generateToken, hashToken, getExpiryDate, isTokenExpired } = require("./token.service");
const { sendVerificationEmail, sendPasswordResetEmail, sendSafe } = require("./email.service");

const generateVerificationData = (hours = 24) => {
  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpires = getExpiryDate(hours);
  return { rawToken, hashedToken, tokenExpires };
};

const findUserByEmail = async (email, select) => {
  return prisma.user.findUnique({ where: { email }, select });
};

const register = async ({ email, password, firstName, lastName, phone }) => {
  const existingUser = await findUserByEmail(email, { id: true });

  if (existingUser) {
    throw new AppError("El usuario ya existe", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { rawToken, hashedToken, tokenExpires } = generateVerificationData();

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: tokenExpires,
    },
  });

  await sendSafe(() => sendVerificationEmail(email, rawToken));

  return { statusCode: 201, body: { message: "Usuario creado correctamente" } };
};

const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Credenciales invalidas", 400);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Credenciales invalidas", 400);
  }

  if (!user.emailVerified) {
    throw new AppError("Debes verificar tu correo electrónico antes de iniciar sesión", 403);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return {
    statusCode: 200,
    body: {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        avatarPublicId: user.avatarPublicId,
        createdAt: user.createdAt,
      },
    },
  };
};

const resendVerification = async ({ email }) => {
  const user = await findUserByEmail(email, { id: true, emailVerified: true });

  if (!user) {
    return {
      statusCode: 200,
      body: {
        success: true,
        message: "Si el correo está registrado, recibirás un enlace de verificación",
      },
    };
  }

  if (user.emailVerified) {
    return {
      statusCode: 409,
      body: {
        success: false,
        message: "El usuario ya se encuentra verificado.",
      },
    };
  }

  const { rawToken, hashedToken, tokenExpires } = generateVerificationData();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: tokenExpires,
    },
  });

  await sendSafe(() => sendVerificationEmail(email, rawToken));

  return {
    statusCode: 200,
    body: {
      success: true,
      message: "Nuevo correo de verificación enviado.",
    },
  };
};

const unverifyUser = async ({ email }) => {
  const user = await findUserByEmail(email, { id: true, emailVerified: true });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  if (!user.emailVerified) {
    return {
      statusCode: 200,
      body: {
        success: true,
        message: "El usuario ya se encontraba desverificado.",
      },
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: false,
    },
  });

  return {
    statusCode: 200,
    body: {
      success: true,
      message: "Usuario desverificado correctamente.",
    },
  };
};

const resetVerification = async ({ email }) => {
  const user = await findUserByEmail(email, { id: true, emailVerified: true });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const { rawToken, hashedToken, tokenExpires } = generateVerificationData();

  const updateData = {
    emailVerificationToken: hashedToken,
    emailVerificationExpires: tokenExpires,
  };

  if (user.emailVerified) {
    updateData.emailVerified = false;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  await sendSafe(() => sendVerificationEmail(email, rawToken));

  return {
    statusCode: 200,
    body: {
      success: true,
      message: user.emailVerified
        ? "Usuario desverificado y nuevo correo de verificación enviado."
        : "Nuevo correo de verificación enviado.",
    },
  };
};

const verifyEmail = async ({ token }) => {
  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { not: null },
    },
    select: { id: true, email: true, emailVerified: true, emailVerificationExpires: true },
  });

  if (!user) {
    if (env.NODE_ENV === "development") {
      console.log(`[auth] verify-email: token not found → 400`);
    }
    throw new AppError("Token de verificación inválido", 400);
  }

  if (user.emailVerified) {
    if (env.NODE_ENV === "development") {
      console.log(`[auth] verify-email: user ${user.email} already verified → 200 (idempotent)`);
    }
    return { statusCode: 200, body: { message: "Correo verificado correctamente" } };
  }

  if (isTokenExpired(user.emailVerificationExpires)) {
    throw new AppError("El token de verificación ha expirado", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
    },
  });

  if (env.NODE_ENV === "development") {
    console.log(`[auth] verify-email: user ${user.email} verified successfully → 200`);
  }

  return { statusCode: 200, body: { message: "Correo verificado correctamente" } };
};

const forgotPassword = async ({ email }) => {
  const user = await findUserByEmail(email, { id: true });

  if (!user) {
    return {
      statusCode: 200,
      body: {
        message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
      },
    };
  }

  const { rawToken, hashedToken, tokenExpires } = generateVerificationData(1);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: tokenExpires,
    },
  });

  await sendSafe(() => sendPasswordResetEmail(email, rawToken));

  return {
    statusCode: 200,
    body: {
      message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
    },
  };
};

const resetPassword = async ({ token, password }) => {
  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { not: null },
    },
    select: { id: true, passwordResetExpires: true },
  });

  if (!user) {
    throw new AppError("Token de restablecimiento inválido", 400);
  }

  if (isTokenExpired(user.passwordResetExpires)) {
    throw new AppError("El token de restablecimiento ha expirado", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return { statusCode: 200, body: { message: "Contraseña actualizada correctamente" } };
};

module.exports = {
  generateVerificationData,
  register,
  login,
  resendVerification,
  unverifyUser,
  resetVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
};