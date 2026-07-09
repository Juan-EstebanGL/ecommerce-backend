import api from "./axios";

export function getProductReviews(productId) {
  return api.get(`/products/${productId}/reviews`);
}

export function createReview(productId, data) {
  return api.post(`/products/${productId}/reviews`, data);
}

export function updateReview(reviewId, data) {
  return api.put(`/reviews/${reviewId}`, data);
}

export function deleteReview(reviewId) {
  return api.delete(`/reviews/${reviewId}`);
}

export function getAdminReviews() {
  return api.get("/reviews/admin");
}
