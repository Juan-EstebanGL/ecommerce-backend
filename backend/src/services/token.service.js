const crypto = require("crypto");

const TOKEN_BYTE_LENGTH = 40;
const DEFAULT_EXPIRY_HOURS = 24;

const generateToken = () => {
  return crypto.randomBytes(TOKEN_BYTE_LENGTH).toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getExpiryDate = (hours = DEFAULT_EXPIRY_HOURS) => {
  const now = new Date();
  now.setHours(now.getHours() + hours);
  return now;
};

const isTokenExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

module.exports = {
  generateToken,
  hashToken,
  getExpiryDate,
  isTokenExpired,
};
