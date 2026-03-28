function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  let status = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join("; ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id format";
  }

  res.status(status).json({
    success: false,
    message,
    data: null,
  });
}

module.exports = { errorHandler };
