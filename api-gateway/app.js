const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const sampleRoutes = require("./routes/sampleRoutes");

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
      target: "http://localhost:3001",
      changeOrigin: true,
      pathRewrite: { "^/api/users": "" },
    })
  );
  app.use(
    "/api/products",
    createProxyMiddleware({
      target: "http://localhost:3002",
      changeOrigin: true,
      pathRewrite: { "^/api/products": "" },
    })
  );
  app.use(
    "/api/cart",
    createProxyMiddleware({
      target: "http://localhost:3003",
      changeOrigin: true,
      pathRewrite: { "^/api/cart": "" },
    })
  );
  app.use(
    "/api/orders",
    createProxyMiddleware({
      target: "http://localhost:3004",
      changeOrigin: true,
      pathRewrite: { "^/api/orders": "" },
      on: {
        proxyRes(proxyRes) {
          const location = proxyRes.headers.location;
          if (location && location.startsWith("/")) {
            proxyRes.headers.location = `/api/orders${location}`;
          }
        },
      },
    })
  );
  app.use(
    "/api/payments",
    createProxyMiddleware({
      target: "http://localhost:3005",
      changeOrigin: true,
      pathRewrite: { "^/api/payments": "" },
    })
  );
  app.use(
    "/api/inventory",
    createProxyMiddleware({
      target: "http://localhost:3006",
      changeOrigin: true,
      pathRewrite: { "^/api/inventory": "" },
    })
  );

  return app;
}

module.exports = createApp;


