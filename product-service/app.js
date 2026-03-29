const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const productRoutes = require("./src/routes/productRoutes");
const { swaggerSpec, swaggerUi } = require("./swagger");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (req, res) => {
    res.status(200).json({
      service: "product-service",
      status: "ok",
      message: "Product Service is running",
    });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api/products", productRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}

module.exports = createApp;
