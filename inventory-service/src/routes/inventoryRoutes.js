const express = require("express");

const {
  createInventory,
  getAllInventory,
  getInventoryByProductId,
  updateInventory,
  reduceStock,
} = require("../controllers/inventoryController");

const router = express.Router();

/**
 * @openapi
 * /api/inventory/reduce:
 *   post:
 *     summary: Reduce stock for a product
 *     description: Decrements quantity atomically; rejects if stock would go negative.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, amount]
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Business product identifier
 *               amount:
 *                 type: number
 *                 description: Units to subtract (positive number)
 *               qty:
 *                 type: number
 *                 description: Alias for amount
 *           example:
 *             productId: "SKU-1001"
 *             amount: 2
 *     responses:
 *       200:
 *         description: Stock reduced
 *       400:
 *         description: Invalid input or insufficient stock
 *       404:
 *         description: Product inventory not found
 */
router.post("/reduce", reduceStock);

/**
 * @openapi
 * /api/inventory:
 *   post:
 *     summary: Create inventory record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *               productName:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 minimum: 0
 *               warehouse:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *   get:
 *     summary: List all inventory records
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/", createInventory);
router.get("/", getAllInventory);

/**
 * @openapi
 * /api/inventory/{productId}:
 *   get:
 *     summary: Get inventory by product ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business product identifier
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update inventory fields for a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 minimum: 0
 *               warehouse:
 *                 type: string
 *           example:
 *             quantity: 50
 *             warehouse: "WH-EAST"
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Invalid body
 *       404:
 *         description: Not found
 */
router.get("/:productId", getInventoryByProductId);
router.put("/:productId", updateInventory);

module.exports = router;
