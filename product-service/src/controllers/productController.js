const mongoose = require("mongoose");
const Product = require("../models/Product");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function createProduct(req, res) {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
}

async function getProducts(req, res) {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};