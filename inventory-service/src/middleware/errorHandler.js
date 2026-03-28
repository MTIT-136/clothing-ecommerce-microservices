function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err.jsonBody) {
    res.status(err.statusCode || 500).json(err.jsonBody);
    return;
  }

  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    status = 400;
    message = err.message;
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id format";
  }

  res.status(status).json({ message });
}

module.exports = { errorHandler };
