import api from "./axios";

export function getCart() {
  return api.get("/cart");
}

export function addToCart(productId, quantity) {
  return api.post("/cart/add", { productId, quantity });
}

export function updateCartItem(id, quantity) {
  return api.patch(`/cart/${id}`, { quantity });
}

export function removeCartItem(id) {
  return api.delete(`/cart/${id}`);
}
