const { sendSuccess } = require("../utils/response");

function health(req, res) {
  sendSuccess(res, "Service is healthy", {
    service: process.env.SERVICE_NAME || "order-service",
    status: "ok",
  });
}

module.exports = { health };
