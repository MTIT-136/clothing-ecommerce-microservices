const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const sampleRoutes = require("./routes/sampleRoutes");

const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:3001";
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";
const cartServiceUrl = process.env.CART_SERVICE_URL || "http://localhost:3003";
const orderServiceUrl = process.env.ORDER_SERVICE_URL || "http://localhost:3004";
const reviewServiceUrl = process.env.REVIEW_SERVICE_URL || "http://localhost:3006";
const inventoryServiceUrl = process.env.INVENTORY_SERVICE_URL || "http://localhost:3005";

/**
 * Rewrites redirect Location headers from upstream so relative paths stay under the gateway mount
 * (Swagger UI often redirects to /api-docs/ without the gateway prefix).
 */
function createLocationRewriteHandler(gatewayPrefix) {
  return function locationRewriteProxyRes(proxyRes) {
    const location = proxyRes.headers.location;
    if (!location) return;
    if (location.startsWith(gatewayPrefix)) return;

    if (location.startsWith("/")) {
      proxyRes.headers.location = `${gatewayPrefix}${location}`;
      return;
    }

    try {
      const u = new URL(location);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        const p = u.pathname + u.search;
        if (p.startsWith("/") && !p.startsWith(gatewayPrefix)) {
          proxyRes.headers.location = `${gatewayPrefix}${p}`;
        }
      }
    } catch {
      // ignore invalid Location
    }
  };
}

/** Product & inventory: REST under /api/<name>; Swagger only at /api-docs on the service. */
function createPathRewritePrefixedApi(apiPrefix) {
  return (path) => {
    if (path === "/api-docs" || path.startsWith("/api-docs/")) {
      return path;
    }
    return `${apiPrefix}${path}`;
  };
}

/**
 * Cart & review: docs/openapi at service root; REST paths do not repeat the gateway segment.
 * `listPath` maps the gateway base (proxied as `/`) to the collection route, like GET /api/products.
 */
function createPathRewriteStripGatewayPrefix(stripRegex, { listPath } = {}) {
  return (path) => {
    if (path === "/api-docs" || path.startsWith("/api-docs/")) {
      return path;
    }
    if (path === "/openapi.json" || path.startsWith("/openapi.json")) {
      return path;
    }
    const normalized = path === "" ? "/" : path;
    if (listPath && normalized === "/") {
      return listPath;
    }
    if (stripRegex.test(path)) {
      return path.replace(stripRegex, "") || "/";
    }
    return path;
  };
}

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

  app.use("/", sampleRoutes);

  app.use(
    "/api/users",
    createProxyMiddleware({
      target: userServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/users": "" },
    }),
  );

  app.use(
    "/api/products",
    createProxyMiddleware({
      target: productServiceUrl,
      changeOrigin: true,
      pathRewrite: createPathRewritePrefixedApi("/api/products"),
      on: { proxyRes: createLocationRewriteHandler("/api/products") },
    }),
  );

  app.use(
    "/api/cart",
    createProxyMiddleware({
      target: cartServiceUrl,
      changeOrigin: true,
      pathRewrite: createPathRewriteStripGatewayPrefix(/^\/api\/cart/, { listPath: "/carts" }),
      on: { proxyRes: createLocationRewriteHandler("/api/cart") },
    }),
  );

  app.use(
    "/api/orders",
    createProxyMiddleware({
      target: orderServiceUrl,
      changeOrigin: true,
      pathRewrite: { "^/api/orders": "" },
      on: { proxyRes: createLocationRewriteHandler("/api/orders") },
    }),
  );

  app.use(
    "/api/reviews",
    createProxyMiddleware({
      target: reviewServiceUrl,
      changeOrigin: true,
      pathRewrite: createPathRewriteStripGatewayPrefix(/^\/api\/reviews/, { listPath: "/reviews" }),
      on: { proxyRes: createLocationRewriteHandler("/api/reviews") },
    }),
  );

  app.use(
    "/api/inventory",
    createProxyMiddleware({
      target: inventoryServiceUrl,
      changeOrigin: true,
      pathRewrite: createPathRewritePrefixedApi("/api/inventory"),
      on: { proxyRes: createLocationRewriteHandler("/api/inventory") },
    }),
  );

  return app;
}

module.exports = createApp;
