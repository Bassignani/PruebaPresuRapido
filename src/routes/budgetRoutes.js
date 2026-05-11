const express = require('express');
const {
  generateBudgetNumber,
  saveBudget,
  loadBudget,
  listBudgets,
} = require('../services/budgetService');

function createBudgetRouter(storageDir, requireAuth) {
  const router = express.Router();

  router.post('/new', requireAuth, (_req, res) => {
    try {
      const budget = generateBudgetNumber(storageDir);
      res.json({ success: true, budgetNumber: budget.number });
    } catch (error) {
      console.error('Error generating budget number:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/save', requireAuth, (req, res) => {
    try {
      const { budgetNumber, data } = req.body;

      if (!budgetNumber || !data) {
        return res.status(400).json({ success: false, error: 'Missing budgetNumber or data' });
      }

      const saved = saveBudget(storageDir, budgetNumber, data);
      return res.json({
        success: true,
        message: 'Presupuesto guardado correctamente',
        path: saved.budgetDir,
      });
    } catch (error) {
      console.error('Error saving budget:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/list', requireAuth, (_req, res) => {
    try {
      const budgets = listBudgets(storageDir);
      res.json({ success: true, budgets });
    } catch (error) {
      console.error('Error listing budgets:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/:number', requireAuth, (req, res) => {
    try {
      const budget = loadBudget(storageDir, req.params.number);

      if (!budget) {
        return res.status(404).json({ success: false, error: 'Presupuesto no encontrado' });
      }

      return res.json({ success: true, budget });
    } catch (error) {
      console.error('Error loading budget:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

module.exports = { createBudgetRouter };
