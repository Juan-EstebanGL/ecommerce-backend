const NAME_RE = /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d+$/;

export function validateFirstName(value) {
  const v = value.trim();
  if (!v) return "El nombre es obligatorio";
  if (v.length < 2) return "El nombre debe tener al menos 2 caracteres";
  if (v.length > 50) return "El nombre no debe exceder 50 caracteres";
  if (!NAME_RE.test(v)) return "El nombre solo debe contener letras";
  return "";
}

export function validateLastName(value) {
  const v = value.trim();
  if (!v) return "El apellido es obligatorio";
  if (v.length < 2) return "El apellido debe tener al menos 2 caracteres";
  if (v.length > 50) return "El apellido no debe exceder 50 caracteres";
  if (!NAME_RE.test(v)) return "El apellido solo debe contener letras";
  return "";
}

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return "El correo electrónico es obligatorio";
  if (!EMAIL_RE.test(v)) return "El formato del correo electrónico no es válido";
  return "";
}

export function validatePhone(value) {
  const v = value.trim();
  if (!v) return "El teléfono es obligatorio";
  if (!PHONE_RE.test(v)) return "El teléfono solo puede contener números";
  if (v.length < 7) return "Debe contener entre 7 y 15 dígitos";
  if (v.length > 15) return "Debe contener entre 7 y 15 dígitos";
  return "";
}

export function validatePassword(value) {
  if (!value) return "La contraseña es obligatoria";
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  return "";
}

export function validateConfirmPassword(value, password) {
  if (!value) return "Debes confirmar la contraseña";
  if (value !== password) return "Las contraseñas no coinciden";
  return "";
}

export function filterPhoneDigits(value) {
  return value.replace(/\D/g, "");
}

export function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { level: 1, label: "Débil", color: "#dc2626" };
  if (score <= 3) return { level: 2, label: "Media", color: "#f59e0b" };
  return { level: 3, label: "Fuerte", color: "#16a34a" };
}
