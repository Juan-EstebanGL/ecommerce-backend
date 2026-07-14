const express = require("express");
const router = express.Router();

const {
  register,
  login,
  resendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

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
router.post("/register", register);

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
router.post("/login", login);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenviar correo de verificación
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
 *               message: Si el correo está registrado, recibirás un enlace de verificación
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/resend-verification", resendVerification);

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
router.post("/forgot-password", forgotPassword);

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
router.post("/reset-password", resetPassword);

module.exports = router;
