const Inventory = require("../models/inventoryModel");
const { HttpError } = require("../middleware/httpError");
const { isValidQuantity } = require("../utils/validation");

async function createRecord(body) {
  const { productId, productName, quantity, warehouse } = body;

  if (productId == null || String(productId).trim() === "") {
    throw new HttpError(400, "productId is required");
  }

  const qty = Number(quantity);
  if (!isValidQuantity(qty)) {
    throw new HttpError(
      400,
      "quantity is required and must be a non-negative number"
    );
  }

  try {
    return await Inventory.create({
      productId: String(productId).trim(),
      productName,
      quantity: qty,
      warehouse,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      throw new HttpError(400, err.message);
    }
    throw err;
  }
}

async function findAll() {
  return Inventory.find().sort({ createdAt: -1 }).lean();
}

async function findByProductId(productId) {
  if (!productId || String(productId).trim() === "") {
    throw new HttpError(400, "productId is required");
  }

  const item = await Inventory.findOne({
    productId: String(productId).trim(),
  }).lean();

  if (!item) {
    throw new HttpError(404, "Inventory not found for this product");
  }

  return item;
}

async function updateByProductId(productId, body) {
  if (!productId || String(productId).trim() === "") {
    throw new HttpError(400, "productId is required");
  }

  const { productName, quantity, warehouse } = body;
  const updates = {};

  if (productName !== undefined) updates.productName = productName;
  if (warehouse !== undefined) updates.warehouse = warehouse;
  if (quantity !== undefined) {
    const qty = Number(quantity);
    if (!isValidQuantity(qty)) {
      throw new HttpError(400, "quantity must be a non-negative number");
    }
    updates.quantity = qty;
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, "No valid fields to update");
  }

  try {
    const item = await Inventory.findOneAndUpdate(
      { productId: String(productId).trim() },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!item) {
      throw new HttpError(404, "Inventory not found for this product");
    }

    return item;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (err.name === "ValidationError") {
      throw new HttpError(400, err.message);
    }
    throw err;
  }
}

async function reduceStock(productIdParam, body) {
  const productId = productIdParam ?? body?.productId;
  if (!productId || String(productId).trim() === "") {
    throw new HttpError(400, "productId is required (param or body)");
  }

  const amount = Number(body.amount ?? body.qty);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(
      400,
      "amount must be a positive number (use body.amount or body.qty)"
    );
  }

  const pid = String(productId).trim();

  try {
    const updated = await Inventory.findOneAndUpdate(
      { productId: pid, quantity: { $gte: amount } },
      { $inc: { quantity: -amount } },
      { new: true, runValidators: true }
    ).lean();

    if (updated) {
      return updated;
    }

    const exists = await Inventory.findOne({ productId: pid }).lean();
    if (!exists) {
      throw new HttpError(404, "Inventory not found for this product");
    }

    throw new HttpError(
      400,
      "Insufficient stock; quantity cannot go negative",
      {
        message: "Insufficient stock; quantity cannot go negative",
        data: {
          productId: pid,
          currentQuantity: exists.quantity,
          requestedReduction: amount,
        },
      }
    );
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (err.name === "ValidationError") {
      throw new HttpError(400, err.message);
    }
    throw err;
  }
}

module.exports = {
  createRecord,
  findAll,
  findByProductId,
  updateByProductId,
  reduceStock,
};
