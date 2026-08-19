const asyncHandler = require("../utils/asyncHandler");
const {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  unverifyUserSchema,
  resetVerificationSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/auth.validation");
const { validate } = require("../validations/validation.helper");
const {
  register,
  login,
  resendVerification,
  unverifyUser,
  resetVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../services/auth.service");

const respond = (res, result) => {
  return res.status(result.statusCode).json(result.body);
};

const registerHandler = asyncHandler(async (req, res) => {
  const data = validate(registerSchema, req.body || {});
  return respond(res, await register(data));
}, "Error interno del servidor");

const loginHandler = asyncHandler(async (req, res) => {
  const data = validate(loginSchema, req.body || {});
  return respond(res, await login(data));
}, "Error interno del servidor");

const resendVerificationHandler = asyncHandler(async (req, res) => {
  const data = validate(resendVerificationSchema, req.body || {});
  return respond(res, await resendVerification(data));
}, "Error interno del servidor");

const unverifyUserHandler = asyncHandler(async (req, res) => {
  const data = validate(unverifyUserSchema, req.body || {});
  return respond(res, await unverifyUser(data));
}, "Error interno del servidor");

const resetVerificationHandler = asyncHandler(async (req, res) => {
  const data = validate(resetVerificationSchema, req.body || {});
  return respond(res, await resetVerification(data));
}, "Error interno del servidor");

const verifyEmailHandler = asyncHandler(async (req, res) => {
  const data = validate(verifyEmailSchema, req.query || {});
  return respond(res, await verifyEmail(data));
}, "Error interno del servidor");

const forgotPasswordHandler = asyncHandler(async (req, res) => {
  const data = validate(forgotPasswordSchema, req.body || {});
  return respond(res, await forgotPassword(data));
}, "Error interno del servidor");

const resetPasswordHandler = asyncHandler(async (req, res) => {
  const data = validate(resetPasswordSchema, req.body || {});
  return respond(res, await resetPassword(data));
}, "Error interno del servidor");

module.exports = {
  register: registerHandler,
  login: loginHandler,
  resendVerification: resendVerificationHandler,
  unverifyUser: unverifyUserHandler,
  resetVerification: resetVerificationHandler,
  verifyEmail: verifyEmailHandler,
  forgotPassword: forgotPasswordHandler,
  resetPassword: resetPasswordHandler,
};