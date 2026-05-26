const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // verificar header
    if (!authHeader) {
      return res.status(401).json({
        message: "Token requerido",
      });
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
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};

module.exports = authMiddleware;
