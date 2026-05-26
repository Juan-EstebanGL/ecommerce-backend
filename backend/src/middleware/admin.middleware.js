const AppError = require("../utils/AppError");

const adminMiddleware = (req, res, next) => {
  if (req.userRole !== "ADMIN") {
    return next(new AppError("Acceso denegado", 403));
  }

  next();
};

module.exports = adminMiddleware;
