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

const orderIdParamsSchema = z.object({
  params: z.object({
    id: positiveInteger("id debe ser un entero positivo"),
  }),
});

const updateOrderStatusSchema = orderIdParamsSchema.extend({
  body: z.object({
    status: z.enum(
      ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
      {
        error: "status invalido",
      }
    ),
  }),
});

module.exports = {
  orderIdParamsSchema,
  updateOrderStatusSchema,
};
