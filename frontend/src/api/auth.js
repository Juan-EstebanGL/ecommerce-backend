import api from "./axios";

export function register({ email, password }) {
  return api.post("/auth/register", { email, password });
}

export function login({ email, password }) {
  return api.post("/auth/login", { email, password });
}
