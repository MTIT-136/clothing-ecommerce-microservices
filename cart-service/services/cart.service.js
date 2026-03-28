const Cart = require("../models/cart.model");
const ApiError = require("../utils/apiError");

function normalizeUserId(userId) {
  const value = String(userId || "").trim();
  if (!value) {
    throw new ApiError(400, "userId is required");
  }
  return value;
}

function ensurePositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value < 1) {
    throw new ApiError(400, `${fieldName} must be a positive integer`);
  }
}

function validateAddItemPayload(payload) {
  const requiredFields = ["productId", "productName", "unitPrice", "quantity", "size", "color"];

  for (const field of requiredFields) {
    if (
      payload[field] === undefined ||
      payload[field] === null ||
      String(payload[field]).trim() === ""
    ) {
      throw new ApiError(400, `${field} is required`);
    }
  }

  if (typeof payload.unitPrice !== "number" || payload.unitPrice < 0) {
    throw new ApiError(400, "unitPrice must be a non-negative number");
  }

  ensurePositiveInteger(payload.quantity, "quantity");
}

async function getOrCreateCart(userId) {
  const normalizedUserId = normalizeUserId(userId);
  let cart = await Cart.findOne({ userId: normalizedUserId });

  if (!cart) {
    cart = await Cart.create({ userId: normalizedUserId, items: [] });
  }

  return cart;
}

async function getCartByUserId(userId) {
  const cart = await getOrCreateCart(userId);
  return cart.toClient();
}

function resolveCartItem(cart, itemIdentifier) {
  const normalizedIdentifier = String(itemIdentifier || "").trim();
  if (!normalizedIdentifier) {
    throw new ApiError(400, "itemId is required");
  }

  const bySubdocumentId = cart.items.id(normalizedIdentifier);
  if (bySubdocumentId) {
    return bySubdocumentId;
  }

  const byProductId = cart.items.filter(
    (item) => item.productId === normalizedIdentifier
  );
  if (byProductId.length === 1) {
    return byProductId[0];
  }

  if (byProductId.length > 1) {
    throw new ApiError(
      400,
      "Multiple cart items found for this productId. Use cart itemId instead."
    );
  }

  return null;
}

function findExistingItemIndex(items, itemPayload) {
  return items.findIndex(
    (item) =>
      item.productId === itemPayload.productId &&
      item.size === String(itemPayload.size).trim().toUpperCase() &&
      item.color.toLowerCase() === String(itemPayload.color).trim().toLowerCase()
  );
}

async function addItem(userId, itemPayload) {
  validateAddItemPayload(itemPayload);
  const cart = await getOrCreateCart(userId);

  const index = findExistingItemIndex(cart.items, itemPayload);
  if (index >= 0) {
    cart.items[index].quantity += itemPayload.quantity;
    cart.items[index].unitPrice = itemPayload.unitPrice;
    cart.items[index].productName = String(itemPayload.productName).trim();
    if (itemPayload.imageUrl !== undefined) {
      cart.items[index].imageUrl = itemPayload.imageUrl || null;
    }
  } else {
    cart.items.push({
      productId: String(itemPayload.productId).trim(),
      productName: String(itemPayload.productName).trim(),
      unitPrice: itemPayload.unitPrice,
      quantity: itemPayload.quantity,
      size: String(itemPayload.size).trim().toUpperCase(),
      color: String(itemPayload.color).trim(),
      imageUrl: itemPayload.imageUrl || null,
    });
  }

  await cart.save();
  return cart.toClient();
}

async function updateItem(userId, itemId, payload) {
  const cart = await getOrCreateCart(userId);
  const item = resolveCartItem(cart, itemId);

  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  if (payload.quantity !== undefined) {
    ensurePositiveInteger(payload.quantity, "quantity");
    item.quantity = payload.quantity;
  }

  if (payload.size !== undefined) {
    if (!String(payload.size).trim()) {
      throw new ApiError(400, "size cannot be empty");
    }
    item.size = String(payload.size).trim().toUpperCase();
  }

  if (payload.color !== undefined) {
    if (!String(payload.color).trim()) {
      throw new ApiError(400, "color cannot be empty");
    }
    item.color = String(payload.color).trim();
  }

  if (payload.unitPrice !== undefined) {
    if (typeof payload.unitPrice !== "number" || payload.unitPrice < 0) {
      throw new ApiError(400, "unitPrice must be a non-negative number");
    }
    item.unitPrice = payload.unitPrice;
  }

  if (payload.productName !== undefined) {
    if (!String(payload.productName).trim()) {
      throw new ApiError(400, "productName cannot be empty");
    }
    item.productName = String(payload.productName).trim();
  }

  if (payload.imageUrl !== undefined) {
    item.imageUrl = payload.imageUrl || null;
  }

  await cart.save();
  return cart.toClient();
}

async function removeItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);
  const item = resolveCartItem(cart, itemId);

  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  item.deleteOne();
  await cart.save();
  return cart.toClient();
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return cart.toClient();
}

module.exports = {
  getCartByUserId,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
