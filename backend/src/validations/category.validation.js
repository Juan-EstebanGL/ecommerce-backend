const { z } = require("zod");

const categoryParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("id debe ser un entero positivo"),
  }),
});

const categoryName = z
  .string({ error: "El nombre es obligatorio" })
  .trim()
  .min(1, "El nombre es obligatorio")
  .max(100, "El nombre no puede superar 100 caracteres");

const categoryDescription = z
  .string()
  .trim()
  .max(500, "La descripción no puede superar 500 caracteres")
  .optional()
  .nullable();

const categoryImageFields = z.object({
  imageUrl: z.string().optional().nullable(),
  publicId: z.string().optional().nullable(),
});

const createCategorySchema = z.object({
  body: z.object({
    name: categoryName,
    description: categoryDescription,
  }).extend(categoryImageFields.shape),
});

const updateCategorySchema = categoryParamsSchema.extend({
  body: z.object({
    name: categoryName,
    description: categoryDescription,
  }).extend(categoryImageFields.shape),
});

module.exports = {
  categoryParamsSchema,
  createCategorySchema,
  updateCategorySchema,
};
