const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  getAllOrders,
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/order.controller");

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Checkout y ordenes del usuario
 */

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Crear orden desde el carrito
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Orden creada correctamente
 *         content:
 *           application/json:
 *             example:
 *               message: Orden creada correctamente
 *               order:
 *                 id: 1
 *                 total: 99.98
 *                 status: PENDING
 *                 userId: 3
 *                 items:
 *                   - id: 1
 *                     productId: 1
 *                     productName: Mouse gamer
 *                     productPrice: 49.99
 *                     quantity: 2
 *       400:
 *         description: Carrito vacio o stock insuficiente
 *         content:
 *           application/json:
 *             example:
 *               message: El carrito esta vacio
 *       401:
 *         description: Token requerido o invalido
 *       404:
 *         description: Producto no encontrado
 */
router.get("/admin", authMiddleware, adminMiddleware, getAllOrders);
router.post("/checkout", authMiddleware, createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Listar mis ordenes
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Ordenes del usuario autenticado
 *         content:
 *           application/json:
 *             example:
 *               orders:
 *                 - id: 1
 *                   total: 99.98
 *                   status: PENDING
 *                   userId: 3
 *                   items:
 *                     - id: 1
 *                       productId: 1
 *                       productName: Mouse gamer
 *                       productPrice: 49.99
 *                       quantity: 2
 *       401:
 *         description: Token requerido o invalido
 */
router.get("/", authMiddleware, getMyOrders);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Actualizar estado de una orden
 *     tags: [Orders]
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
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *           example:
 *             status: PAID
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             example:
 *               message: Estado de orden actualizado
 *               order:
 *                 id: 1
 *                 total: 99.98
 *                 status: PAID
 *                 userId: 3
 *                 items: []
 *       400:
 *         description: Estado invalido o transicion invalida
 *         content:
 *           application/json:
 *             example:
 *               message: Transicion de estado invalida
 *       401:
 *         description: Token requerido o invalido
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Orden no encontrada
 */
router.patch("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

router.patch("/:id/cancel", authMiddleware, cancelOrder);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Ver detalle de una orden
 *     tags: [Orders]
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
 *         description: Detalle de la orden
 *         content:
 *           application/json:
 *             example:
 *               order:
 *                 id: 1
 *                 total: 99.98
 *                 status: PENDING
 *                 userId: 3
 *                 items:
 *                   - id: 1
 *                     productId: 1
 *                     productName: Mouse gamer
 *                     productPrice: 49.99
 *                     quantity: 2
 *       400:
 *         description: Id invalido
 *       401:
 *         description: Token requerido o invalido
 *       403:
 *         description: Orden de otro usuario
 *       404:
 *         description: Orden no encontrada
 */
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;
