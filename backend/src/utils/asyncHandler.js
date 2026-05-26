const asyncHandler = (controller, fallbackMessage) => {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch((error) => {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));

      if (fallbackMessage && !normalizedError.isOperational) {
        normalizedError.fallbackMessage = fallbackMessage;
      }

      next(normalizedError);
    });
  };
};

module.exports = asyncHandler;
