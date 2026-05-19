const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validar campos
    if (!email || !password) {
      return res.status(400).json({
        message: "Email y password son requeridos",
      });
    }

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
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // crear carrito automáticamente
    await prisma.cart.create({
      data: {
        userId: user.id,
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y password son requeridos",
      });
    }

    // buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "Credenciales inválidas",
      });
    }

    // comparar password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Credenciales inválidas",
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