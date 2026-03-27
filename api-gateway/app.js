const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const sampleRoutes = require("./routes/sampleRoutes");

const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:3001";
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";
const cartServiceUrl = process.env.CART_SERVICE_URL || "http://localhost:3003";
const orderServiceUrl = process.env.ORDER_SERVICE_URL || "http://localhost:3004";
const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || "http://localhost:3005";
const inventoryServiceUrl = process.env.INVENTORY_SERVICE_URL || "http://localhost:3006";

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  // Simple gateway-level route
  app.use("/", sampleRoutes);

  // Proxy routes to microservices (strip the /api/<service> prefix)
  app.use(
    "/api/users",
    createProxyMiddleware({
      target: userServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/users": "" },
    })
  );
  app.use(
    "/api/products",
    createProxyMiddleware({
      target: productServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/products": "" },
    })
  );
  app.use(
    "/api/cart/api-docs",
    createProxyMiddleware({
      target: cartServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/cart/api-docs": "/api-docs" },
      on: {
        proxyRes(proxyRes) {
          const redirectLocation = proxyRes.headers.location;
          if (redirectLocation && redirectLocation.startsWith("/api-docs")) {
            proxyRes.headers.location = `/api/cart${redirectLocation}`;
          }
        },
      },
    })
  );
  app.use(
    "/api/cart",
    createProxyMiddleware({
      target: cartServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/cart": "" },
    })
  );
  app.use(
    "/api/orders",
    createProxyMiddleware({
      target: orderServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/orders": "" },
    })
  );
  app.use(
    "/api/payments",
    createProxyMiddleware({
      target: paymentServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/payments": "" },
    })
  );
  app.use(
    "/api/inventory",
    createProxyMiddleware({
      target: inventoryServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/inventory": "" },
    })
  );

  return app;
}

module.exports = createApp;

