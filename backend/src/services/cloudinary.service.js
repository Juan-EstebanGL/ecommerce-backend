const cloudinary = require("../config/cloudinary");

const deleteImage = async (publicId) => {
  if (!publicId) return;

  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== "ok" && result.result !== "not found") {
    console.error(
      `[cloudinary] No se pudo eliminar la imagen ${publicId}:`,
      result
    );
  }
};

module.exports = { deleteImage };
