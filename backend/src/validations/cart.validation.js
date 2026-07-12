const { z } = require("zod");

const positiveInteger = (message) => {
  return z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return NaN;
      }

      return Number(value);
    },
    z.number({ error: message }).int(message).positive(message)
  );
};

const cartItemParamsSchema = z.object({
  params: z.object({
    id: positiveInteger("El ID del producto no es válido"),
  }),
});

const addToCartSchema = z.object({
  body: z.object({
    productId: positiveInteger("El ID del producto no es válido"),
    quantity: positiveInteger("La cantidad debe ser un número entero mayor a 0"),
  }),
});

const updateCartItemSchema = cartItemParamsSchema.extend({
  body: z.object({
    quantity: positiveInteger("La cantidad debe ser un número entero mayor a 0"),
  }),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
};
