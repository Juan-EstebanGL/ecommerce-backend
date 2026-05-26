const adminMiddleware = (req, res, next) => {
  if (req.userRole !== "ADMIN") {
    return res.status(403).json({
      message: "Acceso denegado",
    });
  }

  next();
};

module.exports = adminMiddleware;
