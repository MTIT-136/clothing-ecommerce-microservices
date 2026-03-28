const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const orderRoutes = require("./src/routes/orderRoutes");
const { health } = require("./src/controllers/healthController");
const { setupSwagger } = require("./src/config/swagger");
const { errorHandler } = require("./src/middleware/errorHandler");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", health);

  setupSwagger(app);

  app.use("/api/orders", orderRoutes);
  app.use("/", orderRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      data: null,
    });
  });

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
