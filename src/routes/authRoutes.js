const express = require('express');
const { validate } = require('../middleware/validate');
const { loginSchema } = require('../schemas/authSchemas');

function createAuthRouter(authConfig) {
  const router = express.Router();

  router.post('/login', validate(loginSchema), (req, res, next) => {
    const { username, password } = req.body;

    if (username === authConfig.user && password === authConfig.pass) {
      return res.json({ success: true, token: authConfig.token });
    }

    const err = new Error('Usuario o contraseña incorrectos');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    return next(err);
  });

  return router;
}

module.exports = { createAuthRouter };
