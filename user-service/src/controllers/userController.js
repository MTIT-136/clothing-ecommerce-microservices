const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/asyncHandler');
const { sendSuccess } = require('../utils/response');

const registerUser = asyncHandler(async (req, res) => {
  const user = await userService.registerUser(req.body);
  sendSuccess(res, 'User registered successfully', user, 201);
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  sendSuccess(res, 'Users retrieved successfully', users);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, 'User retrieved successfully', user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, 'User updated successfully', user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.deleteUser(req.params.id);
  sendSuccess(res, 'User deleted successfully', user);
});

module.exports = {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
