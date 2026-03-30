const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Inventory Service API",
      version: "1.0.0",
      description: "Inventory microservice (stock by product and warehouse)",
    },
    servers: [
      { url: "http://localhost:8000", description: "Via API gateway" },
      { url: "http://localhost:3005", description: "Inventory service direct" },
    ],
  },
  apis: [path.join(__dirname, "../routes/inventoryRoutes.js")],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = { setupSwagger };
