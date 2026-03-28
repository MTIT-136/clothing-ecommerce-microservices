const express = require("express");

const { setupSwagger } = require("./src/config/swagger");
const healthRoutes = require("./src/routes/sampleRoutes");
const inventoryRoutes = require("./src/routes/inventoryRoutes");
const { errorHandler } = require("./src/middleware/errorHandler");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
    );
  });
  next();
});

setupSwagger(app);

app.use("/api/inventory", healthRoutes);
app.use("/api/inventory", inventoryRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
