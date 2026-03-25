const express = require("express");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    service: process.env.SERVICE_NAME || "user-service",
    status: "ok",
  });
});

module.exports = router;

