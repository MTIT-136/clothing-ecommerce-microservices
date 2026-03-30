const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String },
  quantity: { type: Number, required: true },
  warehouse: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
