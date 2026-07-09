import api from "./axios";

export function getFavorites() {
  return api.get("/favorites");
}

export function addFavorite(productId) {
  return api.post(`/favorites/${productId}`);
}

export function removeFavorite(productId) {
  return api.delete(`/favorites/${productId}`);
}

export function getAdminFavorites() {
  return api.get("/favorites/admin");
}
