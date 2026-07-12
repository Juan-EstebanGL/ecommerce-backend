import api from "./axios";

export function getUsers({ page, limit } = {}) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  return api.get("/users", { params });
}

export function updateUserRole(id, data) {
  return api.patch(`/users/${id}/role`, data);
}

export function deleteUser(id) {
  return api.delete(`/users/${id}`);
}

export function getMyStats() {
  return api.get("/users/me/stats");
}

export function updateAvatar(file) {
  const formData = new FormData();
  formData.append("image", file);
  return api.put("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function deleteAvatar() {
  return api.delete("/users/me/avatar");
}

export function updateProfile(data) {
  return api.put("/users/me/profile", data);
}

export function changePassword(data) {
  return api.put("/users/me/password", data);
}

export function getAddresses() {
  return api.get("/users/me/addresses");
}

export function createAddress(data) {
  return api.post("/users/me/addresses", data);
}

export function updateAddress(id, data) {
  return api.put(`/users/me/addresses/${id}`, data);
}

export function deleteAddress(id) {
  return api.delete(`/users/me/addresses/${id}`);
}

export function setDefaultAddress(id) {
  return api.patch(`/users/me/addresses/${id}/default`);
}
