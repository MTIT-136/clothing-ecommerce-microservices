const ApiError = require("../utils/apiError");

function notFoundHandler(req, res) {
  res.status(404).json({
    message: "Route not found",
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  console.error("[review-service] unhandled error", err);
  return res.status(500).json({
    message: "Internal server error",
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};