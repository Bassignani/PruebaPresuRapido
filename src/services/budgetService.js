const fs = require('fs');
const path = require('path');

function ensureStorage(storageDir) {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
}

function generateBudgetNumber(storageDir, now = new Date()) {
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();

  const dateFolder = `${dd}${mm}${yyyy}`;
  const datePath = path.join(storageDir, dateFolder);

  if (!fs.existsSync(datePath)) {
    fs.mkdirSync(datePath, { recursive: true });
  }

  let counter = 1;
  try {
    const items = fs.readdirSync(datePath);
    const numbers = items
      .map(item => parseInt(item, 10))
      .filter(num => !Number.isNaN(num))
      .sort((a, b) => b - a);

    if (numbers.length > 0) {
      counter = numbers[0] + 1;
    }
  } catch (_err) {
    counter = 1;
  }

  const counterFolder = String(counter).padStart(4, '0');

  return {
    number: `${dateFolder}${counterFolder}`,
    dateFolder,
    counterFolder,
  };
}

function getBudgetPath(storageDir, budgetNumber) {
  const dateFolder = budgetNumber.substring(0, 8);
  const counterFolder = budgetNumber.substring(8, 12);
  return path.join(storageDir, dateFolder, counterFolder, 'presupuesto.json');
}

function saveBudget(storageDir, budgetNumber, data) {
  const budgetPath = getBudgetPath(storageDir, budgetNumber);
  const budgetDir = path.dirname(budgetPath);

  if (!fs.existsSync(budgetDir)) {
    fs.mkdirSync(budgetDir, { recursive: true });
  }

  fs.writeFileSync(budgetPath, JSON.stringify(data, null, 2));

  return {
    budgetPath,
    budgetDir,
  };
}

function loadBudget(storageDir, budgetNumber) {
  const budgetPath = getBudgetPath(storageDir, budgetNumber);

  if (!fs.existsSync(budgetPath)) {
    return null;
  }

  const data = fs.readFileSync(budgetPath, 'utf-8');
  return JSON.parse(data);
}

function listBudgets(storageDir) {
  if (!fs.existsSync(storageDir)) {
    return [];
  }

  const budgets = [];
  const dateFolders = fs.readdirSync(storageDir);

  dateFolders.forEach(dateFolder => {
    const datePath = path.join(storageDir, dateFolder);
    if (!fs.statSync(datePath).isDirectory()) return;

    const counterFolders = fs.readdirSync(datePath);

    counterFolders.forEach(counterFolder => {
      const budgetPath = path.join(datePath, counterFolder, 'presupuesto.json');

      if (fs.existsSync(budgetPath)) {
        const stat = fs.statSync(budgetPath);
        budgets.push({
          number: `${dateFolder}${counterFolder}`,
          date: stat.mtime,
          path: `Storage/${dateFolder}/${counterFolder}`,
        });
      }
    });
  });

  budgets.sort((a, b) => new Date(b.date) - new Date(a.date));
  return budgets;
}

module.exports = {
  ensureStorage,
  generateBudgetNumber,
  saveBudget,
  loadBudget,
  listBudgets,
};
