const express = require("express");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    service: process.env.SERVICE_NAME || "api-gateway",
    status: "ok",
  });
});

module.exports = router;

