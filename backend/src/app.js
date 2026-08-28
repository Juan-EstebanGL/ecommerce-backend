const express = require("express");
const cors = require("cors");
const env = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const uploadRoutes = require("./routes/upload.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const categoryRoutes = require("./routes/category.routes");
const errorMiddleware = require("./middleware/error.middleware");

let swaggerUi = null;
let swaggerSpec = null;

if (env.NODE_ENV === "development") {
  swaggerUi = require("swagger-ui-express");
  swaggerSpec = require("./config/swagger");
}

const app = express();
const localOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];
const normalizeOrigin = (url = "") => url.replace(/\/+$/, "");

const allowedOrigins = new Set(
  [...localOrigins, ...(env.FRONTEND_URL ? [env.FRONTEND_URL] : [])].map(
    normalizeOrigin
  )
);

console.log("[app] Iniciando servidor Express...");
console.log(
  "[app] Rutas registradas: /auth, /products, /cart, /orders, /favorites, /upload" +
    (env.NODE_ENV === "development" ? ", /test, /auth/dev, /api-docs" : "")
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      return callback(new Error("Origen no permitido por CORS"));
    },
  })
);
app.use(express.json());

if (env.NODE_ENV === "development") {
  // Log de depuración solo en desarrollo
  app.use((req, res, next) => {
    console.log(`[app] ${req.method} ${req.originalUrl}`);
    next();
  });
}

app.use("/auth", authRoutes);

if (env.NODE_ENV === "development") {
  const testRoutes = require("./routes/test.routes");
  const authDevRoutes = require("./routes/auth.dev.routes");

  console.log("[auth.dev] Dev auth routes loaded → POST /auth/dev/*");
  app.use("/test", testRoutes);
  app.use("/auth/dev", authDevRoutes);
}

app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/", reviewRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/upload", uploadRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/categories", categoryRoutes);

if (swaggerUi && swaggerSpec) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.use(errorMiddleware);

module.exports = app;
