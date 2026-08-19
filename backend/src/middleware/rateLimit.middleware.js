const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const createLimiter = (options) => {
  if (env.NODE_ENV === "test" && !options.force) {
    return (req, res, next) => next();
  }

  const { force, ...rateLimitOptions } = options;

  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Demasiadas solicitudes. Intenta nuevamente más tarde" },
    ...rateLimitOptions,
  });
};

const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 15,
});

const emailLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
});

const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
});

const uploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
});

module.exports = {
  createLimiter,
  loginLimiter,
  registerLimiter,
  emailLimiter,
  passwordResetLimiter,
  uploadLimiter,
};
