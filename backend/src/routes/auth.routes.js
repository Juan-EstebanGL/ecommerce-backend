const express = require("express");
const router = express.Router();

const {
  register,
  login,
  resendVerification,
  unverifyUser,
  resetVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const {
  loginLimiter,
  registerLimiter,
  emailLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimit.middleware");

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Registro e inicio de sesion
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *           example:
 *             email: user@test.com
 *             password: password123
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             example:
 *               message: Usuario creado correctamente
 *       400:
 *         description: Datos invalidos o usuario existente
 *         content:
 *           application/json:
 *             example:
 *               message: El usuario ya existe
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", registerLimiter, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesion y obtener JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *           example:
 *             email: user@test.com
 *             password: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 id: 1
 *                 email: user@test.com
 *                 role: USER
 *       400:
 *         description: Credenciales invalidas
 *         content:
 *           application/json:
 *             example:
 *               message: Credenciales invalidas
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", loginLimiter, login);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenviar correo de verificación
 *     description: Genera un nuevo token y reenvía el correo. Funciona para usuarios verificados y no verificados.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *           example:
 *             email: user@test.com
 *     responses:
 *       200:
 *         description: Correo reenviado (o mensaje genérico si el usuario no existe)
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Se envió un nuevo correo de verificación.
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/resend-verification", emailLimiter, resendVerification);

/**
 * @swagger
 * /auth/unverify-user:
 *   post:
 *     summary: Desverificar usuario (sin enviar correo)
 *     description: Marca al usuario como no verificado y genera un nuevo token. No envía correo.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *           example:
 *             email: user@test.com
 *     responses:
 *       200:
 *         description: Usuario desverificado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Usuario desverificado correctamente.
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: Usuario no encontrado
 */
router.post("/unverify-user", emailLimiter, unverifyUser);

/**
 * @swagger
 * /auth/reset-verification:
 *   post:
 *     summary: Desverificar usuario y reenviar correo
 *     description: Marca al usuario como no verificado, genera un nuevo token y envía un nuevo correo de verificación.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *           example:
 *             email: user@test.com
 *     responses:
 *       200:
 *         description: Usuario desverificado y correo enviado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Usuario desverificado y nuevo correo de verificación enviado.
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             example:
 *               message: Usuario no encontrado
 */
router.post("/reset-verification", emailLimiter, resetVerification);

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Verificar correo electrónico con token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación recibido por correo
 *     responses:
 *       200:
 *         description: Correo verificado correctamente
 *         content:
 *           application/json:
 *             example:
 *               message: Correo verificado correctamente
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             example:
 *               message: Token de verificación inválido
 */
router.get("/verify-email", verifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *           example:
 *             email: user@test.com
 *     responses:
 *       200:
 *         description: Mensaje informativo (siempre retorna éxito por seguridad)
 *         content:
 *           application/json:
 *             example:
 *               message: Si el correo existe, recibirás un enlace para restablecer tu contraseña
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/forgot-password", passwordResetLimiter, forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *           example:
 *             token: abc123...
 *             password: nuevaPassword123
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *         content:
 *           application/json:
 *             example:
 *               message: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             example:
 *               message: Token de restablecimiento inválido
 */
router.post("/reset-password", passwordResetLimiter, resetPassword);

module.exports = router;
