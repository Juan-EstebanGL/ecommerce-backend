import api from "./axios";

export function getUsers() {
  return api.get("/users");
}

export function updateUserRole(id, data) {
  return api.patch(`/users/${id}/role`, data);
}

export function deleteUser(id) {
  return api.delete(`/users/${id}`);
}
