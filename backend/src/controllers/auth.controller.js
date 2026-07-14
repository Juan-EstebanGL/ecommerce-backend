const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
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

const register = asyncHandler(async (req, res) => {
  const validation = registerSchema.safeParse(req.body || {});

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { email, password } = validation.data;

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
  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpires = getExpiryDate();

  // crear usuario
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: tokenExpires,
    },
  });

  // enviar correo de verificación (no bloquear respuesta si falla)
  try {
    await sendVerificationEmail(email, rawToken);
  } catch (emailError) {
    console.error("[auth] No se pudo enviar el correo de verificación:", emailError.message);
  }

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

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (!user) {
    return res.json({
      message: "Si el correo está registrado, recibirás un enlace de verificación",
    });
  }

  if (user.emailVerified) {
    return res.json({
      message: "El correo ya está verificado",
    });
  }

  // generar nuevo token e invalidar el anterior
  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);
  const tokenExpires = getExpiryDate();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: tokenExpires,
    },
  });

  // enviar correo de verificación (no bloquear respuesta si falla)
  try {
    await sendVerificationEmail(email, rawToken);
  } catch (emailError) {
    console.error("[auth] No se pudo enviar el correo de verificación:", emailError.message);
  }

  return res.json({
    message: "Si el correo está registrado, recibirás un enlace de verificación",
  });
}, "Error interno del servidor");

const verifyEmail = asyncHandler(async (req, res) => {
  const validation = verifyEmailSchema.safeParse(req.query || {});

  if (!validation.success) {
    throw new AppError(getZodErrorMessage(validation.error), 400);
  }

  const { token } = validation.data;
  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { not: null },
    },
    select: { id: true, emailVerified: true, emailVerificationExpires: true },
  });

  if (!user) {
    throw new AppError("Token de verificación inválido", 400);
  }

  if (user.emailVerified) {
    return res.json({
      message: "El correo ya está verificado",
    });
  }

  if (isTokenExpired(user.emailVerificationExpires)) {
    throw new AppError("El token de verificación ha expirado", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

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

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

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

  try {
    await sendPasswordResetEmail(email, rawToken);
  } catch (emailError) {
    console.error("[auth] No se pudo enviar el correo de restablecimiento:", emailError.message);
  }

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
  verifyEmail,
  forgotPassword,
  resetPassword,
};
