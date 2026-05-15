require('dotenv').config();
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

module.exports = {
  port: process.env.PORT || 3000,
  staticDir: path.join(ROOT_DIR, 'public'),
  auth: {
    user: process.env.AUTH_USER || 'admin',
    pass: process.env.AUTH_PASS || 'presu123',
    token: process.env.AUTH_TOKEN || 'presu-token-2026',
  },
};
