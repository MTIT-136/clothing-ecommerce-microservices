const userService = require('../services/userService');

async function registerUser(req, res, next) {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await userService.deleteUser(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
