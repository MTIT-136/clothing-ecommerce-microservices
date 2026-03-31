const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const sampleRoutes = require("./src/routes/sampleRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/errorHandler");
const createOpenApiSpec = require("./src/docs/openapi");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  const openApiSpec = createOpenApiSpec();
  app.get("/openapi.json", (req, res) => {
    res.json(openApiSpec);
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use("/", sampleRoutes);
  app.use("/", cartRoutes);
  app.use("/api", cartRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

