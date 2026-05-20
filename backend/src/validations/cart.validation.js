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
    id: positiveInteger("id debe ser un entero positivo"),
  }),
});

const addToCartSchema = z.object({
  body: z.object({
    productId: positiveInteger("productId debe ser un entero positivo"),
    quantity: positiveInteger("quantity debe ser un entero mayor a 0"),
  }),
});

const updateCartItemSchema = cartItemParamsSchema.extend({
  body: z.object({
    quantity: positiveInteger("quantity debe ser un entero mayor a 0"),
  }),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
};
