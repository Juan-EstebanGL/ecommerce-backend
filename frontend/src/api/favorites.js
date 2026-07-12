import api from "./axios";

export function getFavorites({ page, limit } = {}) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  return api.get("/favorites", { params });
}

export function addFavorite(productId) {
  return api.post(`/favorites/${productId}`);
}

export function removeFavorite(productId) {
  return api.delete(`/favorites/${productId}`);
}

export function getAdminFavorites({ page, limit } = {}) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  return api.get("/favorites/admin", { params });
}
