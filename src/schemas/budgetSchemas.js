const { z } = require('zod');

const saveBudgetSchema = z.object({
  budgetNumber: z.string().regex(/^\d{12}$/, 'budgetNumber debe tener 12 dígitos'),
  data: z.object({
    number: z.string().min(1),
  }).passthrough(),
});

module.exports = { saveBudgetSchema };
