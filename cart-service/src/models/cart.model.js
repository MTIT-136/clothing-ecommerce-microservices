const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    size: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

cartSchema.methods.toClient = function toClient() {
  const subtotal = this.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return {
    id: this._id,
    userId: this.userId,
    items: this.items.map((item) => ({
      itemId: item._id,
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      imageUrl: item.imageUrl,
      lineTotal: item.unitPrice * item.quantity,
    })),
    totalItems: this.items.reduce((sum, item) => sum + item.quantity, 0),
    distinctItems: this.items.length,
    subtotal,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Cart", cartSchema);
