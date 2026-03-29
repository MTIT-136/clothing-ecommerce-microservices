const orderService = require("../services/order.service");
const { asyncHandler } = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/response");

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  sendSuccess(res, "Order created successfully", order, 201);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.listOrders();
  sendSuccess(res, "Orders retrieved successfully", orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  sendSuccess(res, "Order retrieved successfully", order);
});

const getOrdersByUser = asyncHandler(async (req, res) => {
  const orders = await orderService.getOrdersByUserId(req.params.userId);
  sendSuccess(res, "Orders retrieved successfully", orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  sendSuccess(res, "Order status updated successfully", order);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const deleted = await orderService.deleteOrderById(req.params.id);
  sendSuccess(res, "Order deleted successfully", deleted);
});

module.exports = {
  getAllOrders,
  createOrder,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
};
