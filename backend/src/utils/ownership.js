const AppError = require("./AppError");

const assertOwnerOrAdmin = (userRole, userId, resourceUserId, message = "No autorizado") => {
  if (userRole !== "ADMIN" && resourceUserId !== userId) {
    throw new AppError(message, 403);
  }
};

module.exports = { assertOwnerOrAdmin };