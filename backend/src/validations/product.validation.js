const { z } = require("zod");

const numberFromInput = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  return Number(value);
};

const positiveInteger = (message) => {
  return z.preprocess(
    numberFromInput,
    z.number({ error: message }).int(message).positive(message)
  );
};

const positiveNumber = (message) => {
  return z.preprocess(
    numberFromInput,
    z.number({ error: message }).positive(message)
  );
};

const nonNegativeInteger = (message) => {
  return z.preprocess(
    numberFromInput,
    z.number({ error: message }).int(message).min(0, message)
  );
};

const productName = z
  .string({ error: "El nombre es obligatorio" })
  .trim()
  .min(1, "El nombre es obligatorio");

const productPayloadSchema = z.object({
  name: productName,
  price: positiveNumber("El precio debe ser un número mayor a 0"),
  stock: nonNegativeInteger("El stock debe ser un número entero igual o mayor a 0"),
  imageUrl: z.string().optional(),
  publicId: z.string().optional(),
  categoryId: z.preprocess(
    numberFromInput,
    z.number().int().positive().nullable().optional()
  ),
});

const productParamsSchema = z.object({
  params: z.object({
    id: positiveInteger("El ID del producto no es válido"),
  }),
});

const createProductSchema = z.object({
  body: productPayloadSchema,
});

const updateProductSchema = productParamsSchema.extend({
  body: productPayloadSchema,
});

const patchProductSchema = productParamsSchema.extend({
  body: productPayloadSchema
    .partial()
    .refine(
      (data) =>
        data.name !== undefined ||
        data.price !== undefined ||
        data.stock !== undefined ||
        data.imageUrl !== undefined ||
        data.publicId !== undefined ||
        data.categoryId !== undefined,
      {
        message: "Debe enviar al menos un campo para actualizar",
      }
    ),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  patchProductSchema,
  productParamsSchema,
};
