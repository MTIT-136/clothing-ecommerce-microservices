const express = require("express");

const { setupSwagger } = require("./config/swagger");
const healthRoutes = require("./routes/sampleRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

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

module.exports = app;
