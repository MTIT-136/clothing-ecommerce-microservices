const inventoryService = require("../services/inventoryService");
const { asyncHandler } = require("../middleware/asyncHandler");
const { HttpError } = require("../middleware/httpError");

const createInventory = asyncHandler(async (req, res) => {
  try {
    const inventory = await inventoryService.createRecord(req.body);
    res.status(201).json({ data: inventory });
  } catch (err) {
    if (!(err instanceof HttpError)) {
      console.error("[inventory] createInventory:", err);
      return res.status(500).json({ message: "Failed to create inventory" });
    }
    throw err;
  }
});

const getAllInventory = asyncHandler(async (req, res) => {
  try {
    const items = await inventoryService.findAll();
    res.status(200).json({ data: items });
  } catch (err) {
    console.error("[inventory] getAllInventory:", err);
    return res.status(500).json({ message: "Failed to fetch inventory" });
  }
});

const getInventoryByProductId = asyncHandler(async (req, res) => {
  try {
    const item = await inventoryService.findByProductId(req.params.productId);
    res.status(200).json({ data: item });
  } catch (err) {
    if (!(err instanceof HttpError)) {
      console.error("[inventory] getInventoryByProductId:", err);
      return res.status(500).json({ message: "Failed to fetch inventory" });
    }
    throw err;
  }
});

const updateInventory = asyncHandler(async (req, res) => {
  try {
    const item = await inventoryService.updateByProductId(
      req.params.productId,
      req.body
    );
    res.status(200).json({ data: item });
  } catch (err) {
    if (!(err instanceof HttpError)) {
      console.error("[inventory] updateInventory:", err);
      return res.status(500).json({ message: "Failed to update inventory" });
    }
    throw err;
  }
});

const reduceStock = asyncHandler(async (req, res) => {
  try {
    const updated = await inventoryService.reduceStock(
      req.params.productId,
      req.body
    );
    res.status(200).json({ data: updated });
  } catch (err) {
    if (!(err instanceof HttpError)) {
      console.error("[inventory] reduceStock:", err);
      return res.status(500).json({ message: "Failed to reduce stock" });
    }
    throw err;
  }
});

module.exports = {
  createInventory,
  getAllInventory,
  getInventoryByProductId,
  updateInventory,
  reduceStock,
};
