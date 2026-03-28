const cartService = require("../services/cart.service");

async function getCart(req, res) {
  const cart = await cartService.getCartByUserId(req.params.userId);
  res.status(200).json(cart);
}

async function addCartItem(req, res) {
  const cart = await cartService.addItem(req.params.userId, req.body);
  res.status(200).json(cart);
}

async function updateCartItem(req, res) {
  const cart = await cartService.updateItem(
    req.params.userId,
    req.params.itemId,
    req.body
  );
  res.status(200).json(cart);
}

async function removeCartItem(req, res) {
  const cart = await cartService.removeItem(req.params.userId, req.params.itemId);
  res.status(200).json(cart);
}

async function clearUserCart(req, res) {
  const cart = await cartService.clearCart(req.params.userId);
  res.status(200).json(cart);
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearUserCart,
};
