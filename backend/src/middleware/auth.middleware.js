const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // verificar header
    if (!authHeader) {
      return next(new AppError("Token requerido", 401));
    }

    // formato: Bearer token
    const token = authHeader.split(" ")[1];

    // verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // guardar userId en request
    req.userId = decoded.userId;
    req.userRole = decoded.role || "USER";

    next();
  } catch (error) {
    return next(new AppError("Token inválido", 401));
  }
};

module.exports = authMiddleware;
