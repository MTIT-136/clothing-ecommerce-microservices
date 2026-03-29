const SERVICE_CODE_STATUS = {
  INVALID_ID: 400,
  NO_UPDATES: 400,
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  DUPLICATE_EMAIL: 409,
};

function validationDetailsToObject(details) {
  if (!details) return undefined;
  return Object.fromEntries(
    Object.entries(details).map(([key, val]) => [
      key,
      typeof val === 'string' ? val : val.message,
    ])
  );
}

function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let status;
  let message = err.message || 'Internal server error';
  let details;

  if (err.code === 11000) {
    status = 409;
    message = 'Email already registered';
  } else if (SERVICE_CODE_STATUS[err.code]) {
    status = SERVICE_CODE_STATUS[err.code];
    if (err.code === 'VALIDATION_ERROR' && err.details) {
      details = validationDetailsToObject(err.details);
    }
  } else if (err.statusCode || err.status) {
    status = err.statusCode || err.status;
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    details = validationDetailsToObject(err.errors);
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid resource ID';
  } else {
    status = 500;
  }

  if (status === 500) {
    message = 'Internal server error';
    details = undefined;
  }

  const body = { message };
  if (details && Object.keys(details).length > 0) {
    body.details = details;
  }

  res.status(status).json(body);
}

module.exports = errorMiddleware;
