const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { generateToken, hashToken, getExpiryDate } = require("../services/token.service");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/email.service");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
}

async function sendSafe(fn) {
  try {
    await fn();
  } catch (err) {
    console.error("[dev-tools] Error enviando correo:", err.message);
  }
}

router.post(
  "/unverify-email",
  asyncHandler(async (req, res) => {
    const { email } = req.body || {};

    if (!email || !EMAIL_RE.test(email.trim())) {
      throw new AppError("Ingrese un correo electrónico válido", 400);
    }

    const user = await findUserByEmail(email.trim());

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);
    const tokenExpires = getExpiryDate();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: false,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: tokenExpires,
      },
    });

    await sendSafe(() => sendVerificationEmail(user.email, rawToken));

    return res.json({
      message: "Usuario desverificado correctamente. Se envió un nuevo correo de verificación.",
    });
  })
);

router.post(
  "/reset-password-email",
  asyncHandler(async (req, res) => {
    const { email } = req.body || {};

    if (!email || !EMAIL_RE.test(email.trim())) {
      throw new AppError("Ingrese un correo electrónico válido", 400);
    }

    const user = await findUserByEmail(email.trim());

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);
    const tokenExpires = getExpiryDate(1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: tokenExpires,
      },
    });

    await sendSafe(() => sendPasswordResetEmail(user.email, rawToken));

    return res.json({
      message: "Correo de restablecimiento enviado.",
    });
  })
);

router.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { email } = req.body || {};

    if (!email || !EMAIL_RE.test(email.trim())) {
      throw new AppError("Ingrese un correo electrónico válido", 400);
    }

    const user = await findUserByEmail(email.trim());

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return res.json({
      message: "Correo verificado manualmente.",
    });
  })
);

module.exports = router;
