const { z } = require("zod");
const { positiveInteger } = require("./common");

const favoriteParamsSchema = z.object({
  params: z.object({
    productId: positiveInteger("El ID del producto no es válido"),
  }),
});

module.exports = {
  favoriteParamsSchema,
};