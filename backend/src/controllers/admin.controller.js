const adminService = require("../services/admin.service");
const asyncHandler = require("../utils/asyncHandler");

const getSystemInfo = asyncHandler(async (req, res) => {
  const info = await adminService.getSystemInfo();

  return res.json(info);
}, "Error obteniendo información del sistema");

const getDashboard = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboard();

  return res.json(data);
}, "Error obteniendo dashboard");

module.exports = {
  getSystemInfo,
  getDashboard,
};
