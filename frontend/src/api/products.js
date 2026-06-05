import api from "./axios";

export function getProducts() {
  return api.get("/products");
}

export function getProductById(id) {
  return api.get(`/products/${id}`);
}
