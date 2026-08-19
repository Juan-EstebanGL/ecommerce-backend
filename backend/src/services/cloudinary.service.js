const cloudinary = require("../config/cloudinary");

const uploadImage = async (buffer, mimetype, folder) => {
  const b64 = Buffer.from(buffer).toString("base64");
  const dataUri = `data:${mimetype};base64,${b64}`;

  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });
};

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

module.exports = { uploadImage, deleteImage };