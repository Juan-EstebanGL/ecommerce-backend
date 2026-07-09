import api from "./axios";

export function getSystemInfo() {
  return api.get("/admin/system");
}

export function getDashboard() {
  return api.get("/admin/dashboard");
}
