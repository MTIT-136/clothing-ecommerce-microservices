const mongoose = require("mongoose");

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered"];

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, trim: true },
    productName: { type: String, trim: true },
    unitPrice: { type: Number, min: 0 },
    quantity: { type: Number, min: 0 },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => Array.isArray(v) && v.length > 0, "items must be a non-empty array"],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

function computeTotalAmount(items) {
  return items.reduce((sum, item) => {
    const price = Number(item.unitPrice) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);
}

module.exports = {
  Order: mongoose.model("Order", orderSchema),
  ORDER_STATUSES,
  computeTotalAmount,
};
