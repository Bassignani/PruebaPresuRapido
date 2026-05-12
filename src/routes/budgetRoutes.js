const express = require('express');
const { validate } = require('../middleware/validate');
const { saveBudgetSchema } = require('../schemas/budgetSchemas');
const {
  generateBudgetNumber,
  saveBudget,
  loadBudget,
  listBudgets,
} = require('../services/budgetService');

function createBudgetRouter(storageDir, requireAuth) {
  const router = express.Router();

  router.post('/new', requireAuth, (_req, res, next) => {
    try {
      const budget = generateBudgetNumber(storageDir);
      return res.json({ success: true, budgetNumber: budget.number });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/save', requireAuth, validate(saveBudgetSchema), (req, res, next) => {
    try {
      const { budgetNumber, data } = req.body;
      const saved = saveBudget(storageDir, budgetNumber, data);
      return res.json({
        success: true,
        message: 'Presupuesto guardado correctamente',
        path: saved.budgetDir,
      });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/list', requireAuth, (_req, res, next) => {
    try {
      const budgets = listBudgets(storageDir);
      return res.json({ success: true, budgets });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/:number', requireAuth, (req, res, next) => {
    try {
      const budget = loadBudget(storageDir, req.params.number);

      if (!budget) {
        const err = new Error('Presupuesto no encontrado');
        err.status = 404;
        err.code = 'BUDGET_NOT_FOUND';
        return next(err);
      }

      return res.json({ success: true, budget });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = { createBudgetRouter };
