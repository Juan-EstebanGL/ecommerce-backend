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

const favoriteParamsSchema = z.object({
  params: z.object({
    productId: positiveInteger("El ID del producto no es válido"),
  }),
});

module.exports = {
  favoriteParamsSchema,
};
