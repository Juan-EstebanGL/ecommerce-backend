const { z } = require("zod");

const authSchema = z.object({
  email: z
    .string({ error: "El correo electrónico es obligatorio" })
    .trim()
    .email("Ingrese un correo electrónico válido"),
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const NAME_REGEX = /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s]+$/;

const registerSchema = z.object({
  email: z
    .string({ error: "El correo electrónico es obligatorio" })
    .trim()
    .toLowerCase()
    .email("Ingrese un correo electrónico válido"),
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no debe exceder 50 caracteres")
    .regex(NAME_REGEX, "El nombre solo debe contener letras"),
  lastName: z
    .string({ error: "El apellido es obligatorio" })
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no debe exceder 50 caracteres")
    .regex(NAME_REGEX, "El apellido solo debe contener letras"),
  phone: z
    .string({ error: "El teléfono es obligatorio" })
    .trim()
    .min(1, "El teléfono es obligatorio")
    .regex(/^\d+$/, "El teléfono solo debe contener números")
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .max(15, "El teléfono no debe exceder 15 dígitos"),
});

const emailOnlySchema = z.object({
  email: z
    .string({ error: "El correo electrónico es obligatorio" })
    .trim()
    .email("Ingrese un correo electrónico válido"),
});

const verifyEmailSchema = z.object({
  token: z
    .string({ error: "El token es obligatorio" })
    .min(1, "El token no puede estar vacío"),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ error: "El correo electrónico es obligatorio" })
    .trim()
    .email("Ingrese un correo electrónico válido"),
});

const resetPasswordSchema = z.object({
  token: z
    .string({ error: "El token es obligatorio" })
    .min(1, "El token no puede estar vacío"),
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const loginSchema = authSchema;
const resendVerificationSchema = emailOnlySchema;
const unverifyUserSchema = emailOnlySchema;
const resetVerificationSchema = emailOnlySchema;

module.exports = {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  unverifyUserSchema,
  resetVerificationSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
