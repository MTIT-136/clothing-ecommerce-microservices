class HttpError extends Error {
  constructor(statusCode, message, jsonBody = null) {
    super(message);
    this.statusCode = statusCode;
    this.jsonBody = jsonBody;
  }
}

module.exports = { HttpError };
