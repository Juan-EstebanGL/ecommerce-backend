const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favorite.controller");

/**
 * @swagger
 * tags:
 *   - name: Favorites
 *     description: Favoritos (wishlist) del usuario autenticado
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Obtener todos los favoritos del usuario autenticado
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos favoritos
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 userId: 3
 *                 productId: 5
 *                 createdAt: "2026-07-07T12:00:00.000Z"
 *                 product:
 *                   id: 5
 *                   name: Mouse gamer
 *                   price: 49.99
 *                   stock: 10
 *       401:
 *         description: Token requerido o invalido
 */
router.get("/", authMiddleware, getFavorites);

/**
 * @swagger
 * /favorites/{productId}:
 *   post:
 *     summary: Agregar un producto a favoritos
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       201:
 *         description: Producto agregado a favoritos
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               userId: 3
 *               productId: 5
 *               createdAt: "2026-07-07T12:00:00.000Z"
 *               product:
 *                 id: 5
 *                 name: Mouse gamer
 *                 price: 49.99
 *                 stock: 10
 *       400:
 *         description: productId invalido
 *       401:
 *         description: Token requerido o invalido
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: El producto ya está en favoritos
 */
router.post("/:productId", authMiddleware, addFavorite);

/**
 * @swagger
 * /favorites/{productId}:
 *   delete:
 *     summary: Eliminar un producto de favoritos
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       204:
 *         description: Producto eliminado de favoritos
 *       400:
 *         description: productId invalido
 *       401:
 *         description: Token requerido o invalido
 *       404:
 *         description: Favorito no encontrado
 */
router.delete("/:productId", authMiddleware, removeFavorite);

module.exports = router;
