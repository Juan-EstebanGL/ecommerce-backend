const AppError = require("../utils/AppError");

const getZodMessage = (error) => {
  const firstIssue = error.issues && error.issues[0];

  return firstIssue ? firstIssue.message : "Datos invalidos";
};

const normalizePrismaError = (error) => {
  if (error.code === "P2025") {
    return new AppError("Recurso no encontrado", 404);
  }

  if (error.code === "P2002") {
    return new AppError("El recurso ya existe", 400);
  }

  if (error.code === "P2003") {
    return new AppError("Operacion invalida por relacion existente", 400);
  }

  return null;
};

const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.log(error);

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error.issues) {
    return res.status(400).json({
      message: getZodMessage(error),
    });
  }

  const prismaError = normalizePrismaError(error);

  if (prismaError) {
    return res.status(prismaError.statusCode).json({
      message: prismaError.message,
    });
  }

  return res.status(500).json({
    message: error.fallbackMessage || "Error interno del servidor",
  });
};

module.exports = errorMiddleware;
