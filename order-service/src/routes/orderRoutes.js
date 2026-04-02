const express = require("express");
const {
  getAllOrders,
  createOrder,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: List all orders
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     summary: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, items]
 *             properties:
 *               userId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Created
 */
router.get("/", getAllOrders);
router.post("/", createOrder);

/**
 * @openapi
 * /api/orders/user/{userId}:
 *   get:
 *     summary: List orders for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the user
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/user/:userId", getOrdersByUser);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the order
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/:id", getOrderById);

/**
 * @openapi
 * /api/orders/status/{id}:
 *   put:
 *     summary: Update order status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the order
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
 *                 enum: [pending, paid, shipped, delivered]
 *                 description: New status for the order
 *           example:
 *             status: paid
 *     responses:
 *       200:
 *         description: OK
 */
router.put("/status/:id", updateOrderStatus);

/**
 * @openapi
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the order
 *     responses:
 *       200:
 *         description: OK
 */
router.delete("/:id", deleteOrder);

module.exports = router;
