const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { uploadImage } = require("../services/cloudinary.service");

const uploadImageHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No se proporcionó ninguna imagen", 400);
  }

  const result = await uploadImage(req.file.buffer, req.file.mimetype, "ecommerce");

  res.json({
    imageUrl: result.secure_url,
    publicId: result.public_id,
  });
}, "Error al subir la imagen");

module.exports = { uploadImage: uploadImageHandler };