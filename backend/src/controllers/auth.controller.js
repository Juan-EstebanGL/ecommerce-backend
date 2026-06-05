const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  registerSchema,
  loginSchema,
} = require("../validations/auth.validation");
const {
  getZodErrorMessage,
} = require("../validations/validation.helper");

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

  // crear usuario
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

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
      role: user.role,
    },
  });
}, "Error interno del servidor");

module.exports = {
  register,
  login,
};
