const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const sampleRoutes = require("./routes/sampleRoutes");

function createApp() {
  const app = express();

  app.use(cors());
  // Do NOT parse JSON for proxied /api/* routes — the body stream must stay intact for
  // http-proxy-middleware to forward POST/PUT bodies. Parsing here causes long hangs / empty bodies.
  const jsonParser = express.json();
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    jsonParser(req, res, next);
  });
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
          if (!location) return;
          // Avoid redirect loops: do not prefix twice; rewrite relative and same-host paths only
          if (location.startsWith("/api/orders")) return;
          if (location.startsWith("/")) {
            proxyRes.headers.location = `/api/orders${location}`;
            return;
          }
          try {
            const u = new URL(location);
            if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
              const path = u.pathname + u.search;
              if (path.startsWith("/") && !path.startsWith("/api/orders")) {
                proxyRes.headers.location = `/api/orders${path}`;
              }
            }
          } catch {
            // ignore invalid Location
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
    "/api/reviews/api-docs",
    createProxyMiddleware({
      target: reviewServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/reviews/api-docs": "/api-docs" },
      on: {
        proxyRes(proxyRes) {
          const redirectLocation = proxyRes.headers.location;
          if (redirectLocation && redirectLocation.startsWith("/api-docs")) {  
            proxyRes.headers.location = `/api/reviews${redirectLocation}`;     
          }
        },
      },
    })
  );
  app.use(
    "/api/reviews",
    createProxyMiddleware({
      target: reviewServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/reviews": "" },
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


