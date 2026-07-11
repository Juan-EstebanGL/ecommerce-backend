import api from "./axios";

export function checkout(data) {
  return api.post("/orders/checkout", data || {});
}

export function getOrders() {
  return api.get("/orders");
}

export function getOrderById(id) {
  return api.get(`/orders/${id}`);
}

export function getAdminOrders() {
  return api.get("/orders/admin");
}

export function updateOrderStatus(id, data) {
  return api.patch(`/orders/${id}/status`, data);
}
