function health(req, res) {
  res.json({
    success: true,
    message: "Service is healthy",
    data: { service: "order-service", status: "ok" },
  });
}

module.exports = { health };
