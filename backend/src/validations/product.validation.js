const { z } = require("zod");

const numberFromInput = (value) => {
  if (value === null) {
    return NaN;
  }

  if (typeof value === "string" && value.trim() === "") {
    return NaN;
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
  .string({ error: "name no puede estar vacio" })
  .trim()
  .min(1, "name no puede estar vacio");

const productPayloadSchema = z.object({
  name: productName,
  price: positiveNumber("price debe ser mayor a 0"),
  stock: nonNegativeInteger("stock debe ser un entero mayor o igual a 0"),
  imageUrl: z.string().optional(),
  publicId: z.string().optional(),
});

const productParamsSchema = z.object({
  params: z.object({
    id: positiveInteger("id debe ser un entero positivo"),
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
        data.publicId !== undefined,
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
