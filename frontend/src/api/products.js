import api from "./axios";

export function getProducts({ page, limit, categoryId } = {}) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (categoryId) params.categoryId = categoryId;
  return api.get("/products", { params });
}

export function getProductById(id) {
  return api.get(`/products/${id}`);
}

export function createProduct(data) {
  return api.post("/products", data);
}

export function updateProduct(id, data) {
  return api.put(`/products/${id}`, data);
}

export function deleteProduct(id) {
  return api.delete(`/products/${id}`);
}
