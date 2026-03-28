const mongoose = require("mongoose");
const { Order, ORDER_STATUSES, computeTotalAmount } = require("../models/Order");
const { asyncHandler } = require("../middleware/asyncHandler");

function ok(res, message, data, status = 200) {
  res.status(status).json({ success: true, message, data });
}

function validateCreateBody(body) {
  const errors = [];
  if (!body.userId || String(body.userId).trim() === "") {
    errors.push("userId is required");
  }
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    errors.push("items is required and must be a non-empty array");
  }
  return errors;
}

const createOrder = asyncHandler(async (req, res) => {
  const errors = validateCreateBody(req.body);
  if (errors.length) {
    const err = new Error(errors.join("; "));
    err.statusCode = 400;
    throw err;
  }

  const { userId, items } = req.body;
  const totalAmount = computeTotalAmount(items);

  const order = await Order.create({
    userId: String(userId).trim(),
    items,
    totalAmount,
  });

  ok(res, "Order created successfully", order, 201);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  ok(res, "Orders retrieved successfully", orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid order id");
    err.statusCode = 400;
    throw err;
  }

  const order = await Order.findById(id).lean();
  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  ok(res, "Order retrieved successfully", order);
});

const getOrdersByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId || String(userId).trim() === "") {
    const err = new Error("userId is required");
    err.statusCode = 400;
    throw err;
  }

  const orders = await Order.find({ userId: String(userId).trim() })
    .sort({ createdAt: -1 })
    .lean();

  ok(res, "Orders retrieved successfully", orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid order id");
    err.statusCode = 400;
    throw err;
  }

  const { status } = req.body;
  if (!status || typeof status !== "string") {
    const err = new Error("status is required in request body");
    err.statusCode = 400;
    throw err;
  }

  if (!ORDER_STATUSES.includes(status)) {
    const err = new Error(`status must be one of: ${ORDER_STATUSES.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).lean();

  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  ok(res, "Order status updated successfully", order);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid order id");
    err.statusCode = 400;
    throw err;
  }

  const deleted = await Order.findByIdAndDelete(id).lean();
  if (!deleted) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  ok(res, "Order deleted successfully", deleted);
});

module.exports = {
  getAllOrders,
  createOrder,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
};
