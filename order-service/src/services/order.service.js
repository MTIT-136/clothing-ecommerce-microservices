const mongoose = require("mongoose");
const { Order, ORDER_STATUSES, computeTotalAmount } = require("../models/Order");
const ApiError = require("../utils/apiError");

function validateCreateBody(body) {
  if (!body.userId || String(body.userId).trim() === "") {
    throw new ApiError(400, "userId is required");
  }
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    throw new ApiError(400, "items is required and must be a non-empty array");
  }
}

function assertValidObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid order id");
  }
}

async function createOrder(body) {
  validateCreateBody(body);
  const { userId, items } = body;
  const totalAmount = computeTotalAmount(items);
  return Order.create({
    userId: String(userId).trim(),
    items,
    totalAmount,
  });
}

async function listOrders() {
  return Order.find().sort({ createdAt: -1 }).lean();
}

async function getOrderById(id) {
  assertValidObjectId(id);
  const order = await Order.findById(id).lean();
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  return order;
}

async function getOrdersByUserId(userId) {
  if (!userId || String(userId).trim() === "") {
    throw new ApiError(400, "userId is required");
  }
  return Order.find({ userId: String(userId).trim() })
    .sort({ createdAt: -1 })
    .lean();
}

async function updateOrderStatus(id, status) {
  assertValidObjectId(id);
  if (!status || typeof status !== "string") {
    throw new ApiError(400, "status is required in request body");
  }
  if (!ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${ORDER_STATUSES.join(", ")}`);
  }
  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).lean();
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  return order;
}

async function deleteOrderById(id) {
  assertValidObjectId(id);
  const deleted = await Order.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(404, "Order not found");
  }
  return deleted;
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatus,
  deleteOrderById,
};
