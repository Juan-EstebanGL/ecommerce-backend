import api from "./axios";

export function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  return api.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
