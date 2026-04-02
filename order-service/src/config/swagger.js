const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Order Service API",
      version: "1.0.0",
      description: "MVP order microservice (snapshot of cart line items)",
    },
    servers: [
      { url: "http://localhost:3004", description: "Order service (direct)" },
      { url: "http://localhost:8000", description: "Via API Gateway" },
    ],
  },
  apis: [path.join(__dirname, "../routes/orderRoutes.js")],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = { setupSwagger };
