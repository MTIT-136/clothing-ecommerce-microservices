const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Review Service API",
      version: "1.0.0",
      description: "Review microservice for managing product reviews and ratings.",
    },
    servers: [
      {
        url: process.env.SWAGGER_NATIVE_SERVER_URL || `http://localhost:${process.env.PORT || 3006}`,
        description: "Review service direct URL",
      },
      {
        url: process.env.SWAGGER_GATEWAY_SERVER_URL || `http://localhost:${process.env.API_GATEWAY_PORT || 8000}`,
        description: "API gateway URL for review service",
      },
    ],
  },
  apis: [
    path.join(__dirname, "../routes/reviewRoutes.js"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/openapi.json", (req, res) => {
    res.json(swaggerSpec);
  });
}

module.exports = { setupSwagger };