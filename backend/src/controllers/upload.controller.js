const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No se proporcionó ninguna imagen", 400);
  }

  const b64 = Buffer.from(req.file.buffer).toString("base64");
  const dataUri = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "ecommerce",
    resource_type: "image",
  });

  res.json({
    imageUrl: result.secure_url,
    publicId: result.public_id,
  });
}, "Error al subir la imagen");

module.exports = { uploadImage };
