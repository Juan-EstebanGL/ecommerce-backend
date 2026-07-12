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

export function getAdminOrders({ page, limit } = {}) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  return api.get("/orders/admin", { params });
}

export function updateOrderStatus(id, data) {
  return api.patch(`/orders/${id}/status`, data);
}
