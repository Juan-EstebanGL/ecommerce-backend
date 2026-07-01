import Swal from "sweetalert2";

const BRAND = "#0ea5a4";
const DANGER = "#dc2626";
const MUTED = "#6b7280";

export function showSuccess(message) {
  return Swal.fire({
    icon: "success",
    title: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}

export function showError(message) {
  return Swal.fire({
    icon: "error",
    title: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
  });
}

export function showWarning(title, message) {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonColor: BRAND,
    confirmButtonText: "Aceptar",
  });
}

export function showConfirm(title, message, confirmText = "Eliminar", cancelText = "Cancelar") {
  return Swal.fire({
    title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: DANGER,
    cancelButtonColor: MUTED,
    reverseButtons: true,
  });
}
