import api from "./axios";

export function getSystemInfo() {
  return api.get("/admin/system");
}
