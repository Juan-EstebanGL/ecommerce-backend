const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  unverifyUserSchema,
  resetVerificationSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/auth.validation");
const {
  getZodErrorMessage,
} = require("../validations/validation.helper");
const {
  generateToken,
  hashToken,
  getExpiryDate,
  isTokenExpired,
} = require("../services/token.service");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/email.service");

// ─── Reusable helpers ──────────────────────────────────────

async function findUserByEmail(email, select) {
  return prisma.user.findUnique({ where: { email }, select });
}

function generateVerificationData() {
  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpires = getExpiryDate();
  return { rawToken, hashedToken, tokenExpires };
}

async function sendSafe(fn) {
  try {
    await fn();
  } catch (err) {
    console.error("[auth] Error enviando correo:", err.message);
  }
}

// ─── Controllers ───────────────────────────────────────────

const register = asyncHandler(async (req, res) => {
  const validation = registerSchema.safeParse(req.body || {});

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { email, password, firstName, lastName, phone } = validation.data;

  // verificar si usuario existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("El usuario ya existe", 400);
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // generar token de verificación
  const { rawToken, hashedToken, tokenExpires } = generateVerificationData();

  // crear usuario
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

  // enviar correo de verificación (no bloquear respuesta si falla)
  await sendSafe(() => sendVerificationEmail(email, rawToken));

  return res.status(201).json({
    message: "Usuario creado correctamente",
  });
}, "Error interno del servidor");

const login = asyncHandler(async (req, res) => {
  const validation = loginSchema.safeParse(req.body || {});

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { email, password } = validation.data;

  // buscar usuario
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Credenciales invalidas", 400);
  }

  // comparar password
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Credenciales invalidas", 400);
  }

  // verificar correo
  if (!user.emailVerified) {
    return res.status(403).json({
      message: "Debes verificar tu correo electrónico antes de iniciar sesión",
    });
  }

  // generar token
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return res.json({
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
  });
}, "Error interno del servidor");

const resendVerification = asyncHandler(async (req, res) => {
  const validation = resendVerificationSchema.safeParse(req.body || {});

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { email } = validation.data;

  const user = await findUserByEmail(email, { id: true, emailVerified: true });

  if (!user) {
    return res.json({
      success: true,
      message: "Si el correo está registrado, recibirás un enlace de verificación",
    });
  }

  // Si el usuario ya está verificado, no hacer nada
  if (user.emailVerified) {
    return res.status(409).json({
      success: false,
      message: "El usuario ya se encuentra verificado.",
    });
  }

  // generar nuevo token e invalidar el anterior
  const { rawToken, hashedToken, tokenExpires } = generateVerificationData();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: tokenExpires,
    },
  });

  // enviar correo de verificación (no bloquear respuesta si falla)
  await sendSafe(() => sendVerificationEmail(email, rawToken));

  return res.json({
    success: true,
    message: "Nuevo correo de verificación enviado.",
  });
}, "Error interno del servidor");

const unverifyUser = asyncHandler(async (req, res) => {
  const validation = unverifyUserSchema.safeParse(req.body || {});

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { email } = validation.data;

  const user = await findUserByEmail(email, { id: true, emailVerified: true });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  // Si ya está desverificado, no modificar nada
  if (!user.emailVerified) {
    return res.json({
      success: true,
      message: "El usuario ya se encontraba desverificado.",
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: false,
    },
  });

  return res.json({
    success: true,
    message: "Usuario desverificado correctamente.",
  });
}, "Error interno del servidor");

const resetVerification = asyncHandler(async (req, res) => {
  const validation = resetVerificationSchema.safeParse(req.body || {});

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { email } = validation.data;

  const user = await findUserByEmail(email, { id: true, emailVerified: true });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  // generar nuevo token e invalidar el anterior
  const { rawToken, hashedToken, tokenExpires } = generateVerificationData();

  const updateData = {
    emailVerificationToken: hashedToken,
    emailVerificationExpires: tokenExpires,
  };

  // Solo cambiar verified si actualmente está verificado
  if (user.emailVerified) {
    updateData.emailVerified = false;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // enviar correo de verificación
  await sendSafe(() => sendVerificationEmail(email, rawToken));

  return res.json({
    success: true,
    message: user.emailVerified
      ? "Usuario desverificado y nuevo correo de verificación enviado."
      : "Nuevo correo de verificación enviado.",
  });
}, "Error interno del servidor");

const verifyEmail = asyncHandler(async (req, res) => {
  const validation = verifyEmailSchema.safeParse(req.query || {});

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { token } = validation.data;
  const hashedToken = hashToken(token);

  console.log(`[auth] verify-email request received`);

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { not: null },
    },
    select: { id: true, email: true, emailVerified: true, emailVerificationExpires: true },
  });

  if (!user) {
    console.log(`[auth] verify-email: token not found → 400`);
    throw new AppError("Token de verificación inválido", 400);
  }

  if (user.emailVerified) {
    console.log(`[auth] verify-email: user ${user.email} already verified → 200 (idempotent)`);
    return res.json({
      message: "Correo verificado correctamente",
    });
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

  console.log(`[auth] verify-email: user ${user.email} verified successfully → 200`);

  return res.json({
    message: "Correo verificado correctamente",
  });
}, "Error interno del servidor");

const forgotPassword = asyncHandler(async (req, res) => {
  const validation = forgotPasswordSchema.safeParse(req.body || {});

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { email } = validation.data;

  const user = await findUserByEmail(email, { id: true });

  if (!user) {
    return res.json({
      message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
    });
  }

  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpires = getExpiryDate(1);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpires: tokenExpires,
    },
  });

  await sendSafe(() => sendPasswordResetEmail(email, rawToken));

  return res.json({
    message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
  });
}, "Error interno del servidor");

const resetPassword = asyncHandler(async (req, res) => {
  const validation = resetPasswordSchema.safeParse(req.body || {});

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { token, password } = validation.data;
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

  return res.json({
    message: "Contraseña actualizada correctamente",
  });
}, "Error interno del servidor");

module.exports = {
  register,
  login,
  resendVerification,
  unverifyUser,
  resetVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
