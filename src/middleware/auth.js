function createRequireAuth(expectedToken) {
  return function requireAuth(req, _res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (token === expectedToken) {
      return next();
    }

    const err = new Error('No autorizado');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    return next(err);
  };
}

module.exports = { createRequireAuth };
