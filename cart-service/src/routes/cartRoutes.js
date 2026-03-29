const express = require("express");

const cartController = require("../controllers/cart.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/carts", asyncHandler(cartController.listCarts));
router.get("/carts/:userId", asyncHandler(cartController.getCart));
router.post("/carts/:userId/items", asyncHandler(cartController.addCartItem));
router.patch(
  "/carts/:userId/items/:itemId",
  asyncHandler(cartController.updateCartItem)
);
router.delete(
  "/carts/:userId/items/:itemId",
  asyncHandler(cartController.removeCartItem)
);
router.delete("/carts/:userId/items", asyncHandler(cartController.clearUserCart));

module.exports = router;
