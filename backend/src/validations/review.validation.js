const { z } = require("zod");

const numberFromInput = (value) => {
  if (value === null) return NaN;
  if (typeof value === "string" && value.trim() === "") return NaN;
  return Number(value);
};

const positiveInteger = (message) => {
  return z.preprocess(
    numberFromInput,
    z.number({ error: message }).int(message).positive(message)
  );
};

const reviewRating = z.preprocess(
  numberFromInput,
  z
    .number({ error: "rating debe ser un numero entero entre 1 y 5" })
    .int("rating debe ser un numero entero entre 1 y 5")
    .min(1, "rating debe ser un numero entero entre 1 y 5")
    .max(5, "rating debe ser un numero entero entre 1 y 5")
);

const reviewComment = z
  .string({ error: "comment es obligatorio" })
  .trim()
  .min(1, "comment es obligatorio");

const reviewPayloadSchema = z.object({
  rating: reviewRating,
  comment: reviewComment,
});

const reviewParamsSchema = z.object({
  params: z.object({
    id: positiveInteger("id debe ser un entero positivo"),
  }),
});

const createReviewSchema = z.object({
  params: z.object({
    id: positiveInteger("id debe ser un entero positivo"),
  }),
  body: reviewPayloadSchema,
});

const updateReviewSchema = z.object({
  params: z.object({
    id: positiveInteger("id debe ser un entero positivo"),
  }),
  body: reviewPayloadSchema,
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  reviewParamsSchema,
};
