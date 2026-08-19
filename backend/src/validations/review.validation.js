const { z } = require("zod");
const { positiveInteger } = require("./common");

const numberFromInput = (value) => {
  if (value === null) return NaN;
  if (typeof value === "string" && value.trim() === "") return NaN;
  return Number(value);
};

const reviewRating = z.preprocess(
  numberFromInput,
  z
    .number({ error: "La calificación debe ser un número del 1 al 5" })
    .int("La calificación debe ser un número entero del 1 al 5")
    .min(1, "La calificación debe ser un número del 1 al 5")
    .max(5, "La calificación debe ser un número del 1 al 5")
);

const reviewComment = z
  .string({ error: "El comentario es obligatorio" })
  .trim()
  .min(1, "El comentario es obligatorio");

const reviewPayloadSchema = z.object({
  rating: reviewRating,
  comment: reviewComment,
});

const reviewParamsSchema = z.object({
  params: z.object({
    id: positiveInteger("El ID de la reseña no es válido"),
  }),
});

const reviewProductParamsSchema = z.object({
  params: z.object({
    id: positiveInteger("El ID del producto no es válido"),
  }),
});

const createReviewSchema = z.object({
  params: z.object({
    id: positiveInteger("El ID del producto no es válido"),
  }),
  body: reviewPayloadSchema,
});

const updateReviewSchema = z.object({
  params: z.object({
    id: positiveInteger("El ID de la reseña no es válido"),
  }),
  body: reviewPayloadSchema,
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
  reviewProductParamsSchema,
};