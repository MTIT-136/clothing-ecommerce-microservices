const express = require("express");

const cartController = require("../controllers/cart.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(cartController.listCarts));
router.get("/:userId", asyncHandler(cartController.getCart));
router.post("/:userId/items", asyncHandler(cartController.addCartItem));
router.patch(
  "/:userId/items/:itemId",
  asyncHandler(cartController.updateCartItem)
);
router.delete(
  "/:userId/items/:itemId",
  asyncHandler(cartController.removeCartItem)
);
router.delete("/:userId/items", asyncHandler(cartController.clearUserCart));

module.exports = router;
