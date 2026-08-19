const { z } = require("zod");
const { positiveInteger } = require("./common");
const { ORDER_STATUS } = require("../constants/order");

const orderIdParamsSchema = z.object({
  params: z.object({
    id: positiveInteger("El ID de la orden no es válido"),
  }),
});

const createOrderSchema = z.object({
  body: z.object({
    addressId: z
      .preprocess(
        (value) => {
          if (value === null || value === undefined || value === "") return null;
          if (typeof value === "string" && value.trim() === "") return null;
          return Number(value);
        },
        z
          .number({ error: "El ID de la dirección no es válido" })
          .int("El ID de la dirección no es válido")
          .positive("El ID de la dirección no es válido")
          .nullable()
      )
      .optional(),
  }),
});

const updateOrderStatusSchema = orderIdParamsSchema.extend({
  body: z.object({
    status: z.enum(ORDER_STATUS, {
      error: "El estado seleccionado no es válido",
    }),
  }),
});

module.exports = {
  orderIdParamsSchema,
  createOrderSchema,
  updateOrderStatusSchema,
};