const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  patchProduct,
  deleteProduct,
} = require("../controllers/product.controller");

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Gestion y consulta de productos
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Listar productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: Mouse gamer
 *                 price: 49.99
 *                 stock: 10
 *                 userId: 2
 *                 user:
 *                   id: 2
 *                   email: admin@test.com
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener detalle de un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalle del producto
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               name: Mouse gamer
 *               price: 49.99
 *               stock: 10
 *               userId: 2
 *       400:
 *         description: Id invalido
 *       404:
 *         description: Producto no encontrado
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear producto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stock]
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *           example:
 *             name: Teclado mecanico
 *             price: 89.99
 *             stock: 15
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               name: Teclado mecanico
 *               price: 89.99
 *               stock: 15
 *               userId: 1
 *       400:
 *         description: Datos invalidos
 *         content:
 *           application/json:
 *             example:
 *               message: price debe ser mayor a 0
 *       401:
 *         description: Token requerido o invalido
 *       403:
 *         description: Solo administradores
 *         content:
 *           application/json:
 *             example:
 *               message: Acceso denegado
 */
router.post("/", authMiddleware, adminMiddleware, createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar completamente un producto
 *     tags: [Products]
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
 *             name: Teclado mecanico pro
 *             price: 99.99
 *             stock: 8
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               name: Teclado mecanico pro
 *               price: 99.99
 *               stock: 8
 *               userId: 1
 *       400:
 *         description: Datos invalidos
 *       401:
 *         description: Token requerido o invalido
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Producto no encontrado
 */
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Actualizar parcialmente un producto
 *     tags: [Products]
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
 *             stock: 20
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               name: Teclado mecanico pro
 *               price: 99.99
 *               stock: 20
 *               userId: 1
 *       400:
 *         description: Datos invalidos
 *       401:
 *         description: Token requerido o invalido
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Producto no encontrado
 */
router.patch("/:id", authMiddleware, adminMiddleware, patchProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Products]
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
 *         description: Producto eliminado
 *         content:
 *           application/json:
 *             example:
 *               message: Producto eliminado
 *       400:
 *         description: Id invalido
 *       401:
 *         description: Token requerido o invalido
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Producto no encontrado
 */
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
