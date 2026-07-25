import Swal from "sweetalert2";

function isDark() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

function baseOpts() {
  return {
    customClass: {
      popup: isDark() ? "swal-dark" : "swal-light",
    },
    didOpen: (popup) => {
      popup.style.setProperty("font-family", "inherit");
    },
  };
}

export function showSuccess(message) {
  return Swal.fire({
    ...baseOpts(),
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
    ...baseOpts(),
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
    ...baseOpts(),
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "Aceptar",
  });
}

export function showConfirm(title, message, confirmText = "Eliminar", cancelText = "Cancelar") {
  return Swal.fire({
    ...baseOpts(),
    title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
}
