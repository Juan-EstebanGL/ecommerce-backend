const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const env = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const errorMiddleware = require("./middleware/error.middleware");
const swaggerSpec = require("./config/swagger");

const app = express();
const PORT = process.env.PORT || 3000;
const localOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];
const allowedOrigins = env.FRONTEND_URL
  ? [env.FRONTEND_URL, ...localOrigins]
  : localOrigins;

console.log("[app] Iniciando servidor Express...");
console.log(
  "[app] Rutas registradas: /auth, /products, /cart, /orders, /favorites" +
    (env.NODE_ENV === "development" ? ", /test" : "")
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origen no permitido por CORS"));
    },
  })
);
app.use(express.json());

// Log temporal para depurar que rutas entran al backend
app.use((req, res, next) => {
  console.log(`[app] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/auth", authRoutes);

if (env.NODE_ENV === "development") {
  app.use("/test", testRoutes);
}

app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/", reviewRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.use(errorMiddleware);

module.exports = app;
