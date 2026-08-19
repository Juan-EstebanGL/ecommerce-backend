const { z } = require("zod");
const { positiveInteger } = require("./common");

const userIdParamsSchema = z.object({
  params: z.object({
    id: positiveInteger("ID inválido"),
  }),
});

const updateUserRoleSchema = userIdParamsSchema.extend({
  body: z.object({
    role: z
      .string({ error: "El campo role es requerido" })
      .min(1, "El campo role es requerido"),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    email: z
      .string({ error: "El correo electrónico no puede estar vacío" })
      .trim()
      .min(1, "El correo electrónico no puede estar vacío")
      .email("El formato del correo electrónico no es válido")
      .nullable()
      .optional(),
    phone: z.string().trim().optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({ error: "Todos los campos son requeridos" })
      .min(1, "Todos los campos son requeridos"),
    newPassword: z
      .string({ error: "Todos los campos son requeridos" })
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
  }),
});

const addressRequired = (message) =>
  z.string({ error: message }).trim().min(1, message);

const addressFieldsSchema = z.object({
  label: addressRequired("El nombre de la dirección es requerido"),
  recipient: addressRequired("El destinatario es requerido"),
  street: addressRequired("La dirección es requerida"),
  city: addressRequired("La ciudad es requerida"),
  state: addressRequired("El departamento es requerido"),
  phone: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

const createAddressSchema = z.object({
  body: addressFieldsSchema,
});

const updateAddressSchema = z.object({
  params: z.object({
    id: positiveInteger("ID inválido"),
  }),
  body: addressFieldsSchema.partial(),
});

module.exports = {
  userIdParamsSchema,
  updateUserRoleSchema,
  updateProfileSchema,
  changePasswordSchema,
  createAddressSchema,
  updateAddressSchema,
};