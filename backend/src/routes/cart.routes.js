const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
} = require("../controllers/cart.controller");

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Carrito de compras del usuario autenticado
 */

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Agregar producto al carrito
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *           example:
 *             productId: 1
 *             quantity: 2
 *     responses:
 *       200:
 *         description: Item existente actualizado
 *       201:
 *         description: Item creado en el carrito
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               quantity: 2
 *               userId: 3
 *               productId: 1
 *               product:
 *                 id: 1
 *                 name: Mouse gamer
 *                 price: 49.99
 *                 stock: 10
 *       400:
 *         description: Datos invalidos o stock insuficiente
 *         content:
 *           application/json:
 *             example:
 *               message: Stock insuficiente
 *       401:
 *         description: Token requerido o invalido
 *       404:
 *         description: Producto no encontrado
 */
router.post("/add", authMiddleware, addToCart);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Obtener carrito del usuario autenticado
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito del usuario
 *         content:
 *           application/json:
 *             example:
 *               items:
 *                 - id: 1
 *                   quantity: 2
 *                   userId: 3
 *                   productId: 1
 *                   product:
 *                     id: 1
 *                     name: Mouse gamer
 *                     price: 49.99
 *                     stock: 10
 *       401:
 *         description: Token requerido o invalido
 */
router.get("/", authMiddleware, getCart);

/**
 * @swagger
 * /cart/{id}:
 *   patch:
 *     summary: Actualizar cantidad de un item del carrito
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             quantity: 3
 *     responses:
 *       200:
 *         description: Item actualizado
 *       400:
 *         description: Datos invalidos o stock insuficiente
 *       401:
 *         description: Token requerido o invalido
 *       403:
 *         description: Item de otro usuario
 *       404:
 *         description: Item no encontrado
 */
router.patch("/:id", authMiddleware, updateCartItem);

/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     summary: Eliminar item del carrito
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Item eliminado
 *         content:
 *           application/json:
 *             example:
 *               message: Item eliminado del carrito
 *       400:
 *         description: Id invalido
 *       401:
 *         description: Token requerido o invalido
 *       403:
 *         description: Item de otro usuario
 *       404:
 *         description: Item no encontrado
 */
router.delete("/:id", authMiddleware, deleteCartItem);

module.exports = router;
