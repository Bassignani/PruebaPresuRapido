const express = require('express');
const cors = require('cors');
const { port, storageDir, staticDir, auth } = require('./config');
const { ensureStorage } = require('./services/budgetService');
const { createRequireAuth } = require('./middleware/auth');
const { createAuthRouter } = require('./routes/authRoutes');
const { createBudgetRouter } = require('./routes/budgetRoutes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  const requireAuth = createRequireAuth(auth.token);

  ensureStorage(storageDir);

  app.use(cors());
  app.use(express.json());
  app.use(express.static(staticDir));

  app.use('/api', createAuthRouter(auth));
  app.use('/api/budgets', createBudgetRouter(storageDir, requireAuth));

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return { app, port };
}

module.exports = { createApp };
