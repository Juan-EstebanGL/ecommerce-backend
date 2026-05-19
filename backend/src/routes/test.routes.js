const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

console.log("[test.routes] Router de test cargado");

router.get("/", (req, res) => {
  console.log("[test.routes] GET /test alcanzado");
  res.json({ message: "Router /test activo" });
});

router.get("/protected", authMiddleware, (req, res) => {
  console.log("[test.routes] GET /test/protected alcanzado", {
    userId: req.userId,
  });
  res.json({
    message: "Ruta protegida funcionando 🔥",
    userId: req.userId,
  });
});

module.exports = router;