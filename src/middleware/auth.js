function createRequireAuth(expectedToken) {
  return function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (token === expectedToken) {
      return next();
    }

    return res.status(401).json({ success: false, error: 'No autorizado' });
  };
}

module.exports = { createRequireAuth };
