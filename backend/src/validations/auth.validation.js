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

const resendVerificationSchema = z.object({
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

const registerSchema = authSchema;
const loginSchema = authSchema;

module.exports = {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  verifyEmailSchema,
};
