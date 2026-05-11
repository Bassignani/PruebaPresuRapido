const express = require('express');

function createAuthRouter(authConfig) {
  const router = express.Router();

  router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === authConfig.user && password === authConfig.pass) {
      return res.json({ success: true, token: authConfig.token });
    }

    return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
  });

  return router;
}

module.exports = { createAuthRouter };
