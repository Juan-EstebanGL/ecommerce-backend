const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

router.get("/", (req, res) => {
  res.json({ message: "Router /test activo" });
});

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Ruta protegida funcionando 🔥",
    userId: req.userId,
  });
});

module.exports = router;