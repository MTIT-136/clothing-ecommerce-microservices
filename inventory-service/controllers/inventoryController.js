const Inventory = require("../models/inventoryModel");

function isValidQuantity(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

async function createInventory(req, res) {
  try {
    const { productId, productName, quantity, warehouse } = req.body;

    if (productId == null || String(productId).trim() === "") {
      return res.status(400).json({ message: "productId is required" });
    }

    const qty = Number(quantity);
    if (!isValidQuantity(qty)) {
      return res
        .status(400)
        .json({ message: "quantity is required and must be a non-negative number" });
    }

    const inventory = await Inventory.create({
      productId: String(productId).trim(),
      productName,
      quantity: qty,
      warehouse,
    });

    return res.status(201).json({ data: inventory });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    console.error("[inventory] createInventory:", err);
    return res.status(500).json({ message: "Failed to create inventory" });
  }
}

async function getAllInventory(req, res) {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ data: items });
  } catch (err) {
    console.error("[inventory] getAllInventory:", err);
    return res.status(500).json({ message: "Failed to fetch inventory" });
  }
}

async function getInventoryByProductId(req, res) {
  try {
    const { productId } = req.params;
    if (!productId || String(productId).trim() === "") {
      return res.status(400).json({ message: "productId is required" });
    }

    const item = await Inventory.findOne({
      productId: String(productId).trim(),
    }).lean();

    if (!item) {
      return res.status(404).json({ message: "Inventory not found for this product" });
    }

    return res.status(200).json({ data: item });
  } catch (err) {
    console.error("[inventory] getInventoryByProductId:", err);
    return res.status(500).json({ message: "Failed to fetch inventory" });
  }
}

async function updateInventory(req, res) {
  try {
    const { productId } = req.params;
    if (!productId || String(productId).trim() === "") {
      return res.status(400).json({ message: "productId is required" });
    }

    const { productName, quantity, warehouse } = req.body;
    const updates = {};

    if (productName !== undefined) updates.productName = productName;
    if (warehouse !== undefined) updates.warehouse = warehouse;
    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (!isValidQuantity(qty)) {
        return res
          .status(400)
          .json({ message: "quantity must be a non-negative number" });
      }
      updates.quantity = qty;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const item = await Inventory.findOneAndUpdate(
      { productId: String(productId).trim() },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!item) {
      return res.status(404).json({ message: "Inventory not found for this product" });
    }

    return res.status(200).json({ data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    console.error("[inventory] updateInventory:", err);
    return res.status(500).json({ message: "Failed to update inventory" });
  }
}

async function reduceStock(req, res) {
  try {
    const productId = req.params.productId ?? req.body?.productId;
    if (!productId || String(productId).trim() === "") {
      return res.status(400).json({ message: "productId is required (param or body)" });
    }

    const amount = Number(req.body.amount ?? req.body.qty);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "amount must be a positive number (use body.amount or body.qty)" });
    }

    const pid = String(productId).trim();

    const updated = await Inventory.findOneAndUpdate(
      { productId: pid, quantity: { $gte: amount } },
      { $inc: { quantity: -amount } },
      { new: true, runValidators: true }
    ).lean();

    if (updated) {
      return res.status(200).json({ data: updated });
    }

    const exists = await Inventory.findOne({ productId: pid }).lean();
    if (!exists) {
      return res.status(404).json({ message: "Inventory not found for this product" });
    }

    return res.status(400).json({
      message: "Insufficient stock; quantity cannot go negative",
      data: { productId: pid, currentQuantity: exists.quantity, requestedReduction: amount },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    console.error("[inventory] reduceStock:", err);
    return res.status(500).json({ message: "Failed to reduce stock" });
  }
}

module.exports = {
  createInventory,
  getAllInventory,
  getInventoryByProductId,
  updateInventory,
  reduceStock,
};
