const { z } = require("zod");

const authSchema = z.object({
  email: z
    .string({ error: "Email y password son requeridos" })
    .trim()
    .email("Email invalido"),
  password: z
    .string({ error: "Email y password son requeridos" })
    .min(6, "password debe tener minimo 6 caracteres"),
});

const registerSchema = authSchema;
const loginSchema = authSchema;

module.exports = {
  registerSchema,
  loginSchema,
};
