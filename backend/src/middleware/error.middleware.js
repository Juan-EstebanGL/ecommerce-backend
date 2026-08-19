const AppError = require("../utils/AppError");
const env = require("../config/env");

const normalizePrismaError = (error) => {
  if (error.code === "P2025") {
    return new AppError("El recurso solicitado no fue encontrado", 404);
  }

  if (error.code === "P2002") {
    const target = error.meta?.target;
    if (target && target.includes("email")) {
      return new AppError("El correo electrónico ya está en uso", 409);
    }
    if (target && target.includes("name")) {
      return new AppError("Ya existe un registro con ese nombre", 409);
    }
    return new AppError("Esta información ya existe", 409);
  }

  if (error.code === "P2003") {
    return new AppError("No se puede realizar esta operación porque existen registros relacionados", 409);
  }

  return null;
};

const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (env.NODE_ENV === "development") {
    console.log(error);
  } else if (!error.isOperational && !error.issues && error.name !== "MulterError") {
    console.error("[error]", error.message || error);
  }

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "La imagen no debe superar los 5 MB" });
    }

    return res.status(400).json({ message: "Error al procesar el archivo" });
  }

  const prismaError = normalizePrismaError(error);

  if (prismaError) {
    return res.status(prismaError.statusCode).json({
      message: prismaError.message,
    });
  }

  return res.status(500).json({
    message: error.fallbackMessage || "Ocurrió un error inesperado. Intente nuevamente.",
  });
};

module.exports = errorMiddleware;
