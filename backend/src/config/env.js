require("dotenv").config();

const { z } = require("zod");

const envSchema = z.object({
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL es requerida"),
  JWT_SECRET: z.string().trim().min(1, "JWT_SECRET es requerida"),
  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1, "CLOUDINARY_CLOUD_NAME es requerida"),
  CLOUDINARY_API_KEY: z.string().trim().min(1, "CLOUDINARY_API_KEY es requerida"),
  CLOUDINARY_API_SECRET: z.string().trim().min(1, "CLOUDINARY_API_SECRET es requerida"),
  FRONTEND_URL: z.string().trim().optional(),
  NODE_ENV: z.string().trim().optional(),
  PORT: z.string().trim().optional(),
});

const validation = envSchema.safeParse(process.env);

if (!validation.success) {
  const message = validation.error.issues
    .map((issue) => issue.message)
    .join(", ");

  throw new Error(`Variables de entorno invalidas: ${message}`);
}

module.exports = validation.data;
