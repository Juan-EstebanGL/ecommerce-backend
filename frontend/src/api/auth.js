import api from "./axios";

export function register({ email, password }) {
  return api.post("/auth/register", { email, password });
}

export function login({ email, password }) {
  return api.post("/auth/login", { email, password });
}

export function verifyEmail(token) {
  return api.get("/auth/verify-email", { params: { token } });
}

export function resendVerification(email) {
  return api.post("/auth/resend-verification", { email });
}

export function forgotPassword(email) {
  return api.post("/auth/forgot-password", { email });
}

export function resetPassword({ token, password }) {
  return api.post("/auth/reset-password", { token, password });
}
