const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  registerSchema,
  loginSchema,
} = require("../validations/auth.validation");
const {
  getZodErrorMessage,
} = require("../validations/validation.helper");

const register = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body || {});

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const { email, password } = validation.data;

    // verificar si usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
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

    res.status(201).json({
      message: "Usuario creado correctamente",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const login = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body || {});

    if (!validation.success) {
      return res.status(400).json({
        message: getZodErrorMessage(validation.error),
      });
    }

    const { email, password } = validation.data;

    // buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "Credenciales invalidas",
      });
    }

    // comparar password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Credenciales invalidas",
      });
    }

    // generar token
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  register,
  login,
};
