require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const errorMiddleware = require("./middleware/error.middleware");
const swaggerSpec = require("./config/swagger");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("[app] Iniciando servidor Express...");
console.log("[app] Rutas registradas: /auth, /test, /products, /cart, /orders");

app.use(cors());
app.use(express.json());

// Log temporal para depurar que rutas entran al backend
app.use((req, res, next) => {
  console.log(`[app] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/auth", authRoutes);
app.use("/test", testRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
