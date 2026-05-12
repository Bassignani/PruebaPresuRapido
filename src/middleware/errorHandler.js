function errorResponse(res, status, code, message, details) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

function notFoundHandler(_req, res) {
  return errorResponse(res, 404, 'NOT_FOUND', 'Recurso no encontrado');
}

function globalErrorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const code = err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');
  const message = err.message || 'Error interno del servidor';
  const details = err.details;

  if (status >= 500) {
    console.error(err);
  }

  return errorResponse(res, status, code, message, details);
}

module.exports = { errorResponse, notFoundHandler, globalErrorHandler };
