function isValidQuantity(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

module.exports = { isValidQuantity };
