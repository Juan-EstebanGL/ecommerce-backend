require("dotenv").config();

const { z } = require("zod");

const WEAK_JWT_SECRETS = ["your-secret-key-here", "secret", "changeme", "jwt_secret", "secret-key"];

const envSchema = z
  .object({
    DATABASE_URL: z.string().trim().min(1, "DATABASE_URL es requerida"),
    JWT_SECRET: z.string().trim().min(1, "JWT_SECRET es requerida"),
    CLOUDINARY_CLOUD_NAME: z.string().trim().min(1, "CLOUDINARY_CLOUD_NAME es requerida"),
    CLOUDINARY_API_KEY: z.string().trim().min(1, "CLOUDINARY_API_KEY es requerida"),
    CLOUDINARY_API_SECRET: z.string().trim().min(1, "CLOUDINARY_API_SECRET es requerida"),
    RESEND_API_KEY: z.string().trim().min(1, "RESEND_API_KEY es requerida"),
    APP_URL: z.string().trim().min(1, "APP_URL es requerida"),
    FRONTEND_URL: z.string().trim().url("FRONTEND_URL debe ser una URL válida").optional(),
    NODE_ENV: z.string().trim().optional(),
    PORT: z.string().trim().optional(),
  })
  .superRefine((env, ctx) => {
    const nodeEnv = env.NODE_ENV || "development";

    if (nodeEnv !== "production") {
      return;
    }

    if (env.JWT_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "JWT_SECRET debe tener al menos 32 caracteres en producción",
      });
    }

    if (WEAK_JWT_SECRETS.includes(env.JWT_SECRET.toLowerCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "JWT_SECRET no puede ser un valor por defecto en producción",
      });
    }
  });

const validation = envSchema.safeParse(process.env);

if (!validation.success) {
  const message = validation.error.issues
    .map((issue) => issue.message)
    .join(", ");

  throw new Error(`Variables de entorno invalidas: ${message}`);
}

module.exports = validation.data;
