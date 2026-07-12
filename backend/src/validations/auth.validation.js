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

const registerSchema = authSchema;
const loginSchema = authSchema;

module.exports = {
  registerSchema,
  loginSchema,
};
