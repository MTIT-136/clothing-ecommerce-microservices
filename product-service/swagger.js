const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product Service API",
      version: "1.0.0",
      description: "Product microservice API for clothing e-commerce platform",
    },
    servers: [
      {
        url: "http://localhost:3002",
        description: "Direct Product Service",
      },
      {
        url: "http://localhost:8000",
        description: "Via API Gateway",
      },
    ],
  },
  apis: [path.join(__dirname, "./routes/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec,
  swaggerUi,
};
