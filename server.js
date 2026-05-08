const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Crear carpeta Storage si no existe
const storageDir = path.join(__dirname, 'Storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Función para generar número de presupuesto DDMMYYYYNNNN
function generateBudgetNumber() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  
  const dateFolder = `${dd}${mm}${yyyy}`;
  const datePath = path.join(storageDir, dateFolder);
  
  // Crear carpeta de fecha si no existe
  if (!fs.existsSync(datePath)) {
    fs.mkdirSync(datePath, { recursive: true });
  }
  
  // Contar presupuestos del día
  let counter = 1;
  try {
    const items = fs.readdirSync(datePath);
    const numbers = items
      .map(item => parseInt(item))
      .filter(num => !isNaN(num))
      .sort((a, b) => b - a);
    
    if (numbers.length > 0) {
      counter = numbers[0] + 1;
    }
  } catch (err) {
    counter = 1;
  }
  
  const nn = String(counter).padStart(4, '0');
  const budgetNumber = `${dd}${mm}${yyyy}${nn}`;
  
  return {
    number: budgetNumber,
    dateFolder: dateFolder,
    counterFolder: String(counter).padStart(4, '0'),
    fullPath: path.join(datePath, String(counter).padStart(4, '0'))
  };
}

// POST /api/budgets/new - Generar nuevo número de presupuesto
app.post('/api/budgets/new', (req, res) => {
  try {
    const budget = generateBudgetNumber();
    
    // Crear carpeta del presupuesto
    if (!fs.existsSync(budget.fullPath)) {
      fs.mkdirSync(budget.fullPath, { recursive: true });
    }
    
    res.json({
      success: true,
      budgetNumber: budget.number
    });
  } catch (error) {
    console.error('Error generating budget number:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/budgets/save - Guardar presupuesto
app.post('/api/budgets/save', (req, res) => {
  try {
    const { budgetNumber, data } = req.body;
    
    if (!budgetNumber || !data) {
      return res.status(400).json({ success: false, error: 'Missing budgetNumber or data' });
    }
    
    // Extraer fecha y número del presupuesto
    const dateFolder = budgetNumber.substring(0, 8);
    const counterFolder = budgetNumber.substring(8, 12);
    
    const budgetDir = path.join(storageDir, dateFolder, counterFolder);
    
    // Crear carpeta si no existe
    if (!fs.existsSync(budgetDir)) {
      fs.mkdirSync(budgetDir, { recursive: true });
    }
    
    // Guardar presupuesto como JSON
    const budgetPath = path.join(budgetDir, 'presupuesto.json');
    fs.writeFileSync(budgetPath, JSON.stringify(data, null, 2));
    
    res.json({
      success: true,
      message: 'Presupuesto guardado correctamente',
      path: budgetDir
    });
  } catch (error) {
    console.error('Error saving budget:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/budgets/list - Listar presupuestos guardados
app.get('/api/budgets/list', (req, res) => {
  try {
    const budgets = [];
    
    if (!fs.existsSync(storageDir)) {
      return res.json({ success: true, budgets: [] });
    }
    
    const dateFolders = fs.readdirSync(storageDir);
    
    dateFolders.forEach(dateFolder => {
      const datePath = path.join(storageDir, dateFolder);
      
      if (!fs.statSync(datePath).isDirectory()) return;
      
      const counterFolders = fs.readdirSync(datePath);
      
      counterFolders.forEach(counterFolder => {
        const budgetPath = path.join(datePath, counterFolder, 'presupuesto.json');
        
        if (fs.existsSync(budgetPath)) {
          const budgetNumber = `${dateFolder}${counterFolder}`;
          const stat = fs.statSync(budgetPath);
          
          budgets.push({
            number: budgetNumber,
            date: stat.mtime,
            path: `Storage/${dateFolder}/${counterFolder}`
          });
        }
      });
    });
    
    // Ordenar por fecha descendente
    budgets.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ success: true, budgets });
  } catch (error) {
    console.error('Error listing budgets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/budgets/:number - Cargar presupuesto específico
app.get('/api/budgets/:number', (req, res) => {
  try {
    const budgetNumber = req.params.number;
    const dateFolder = budgetNumber.substring(0, 8);
    const counterFolder = budgetNumber.substring(8, 12);
    
    const budgetPath = path.join(storageDir, dateFolder, counterFolder, 'presupuesto.json');
    
    if (!fs.existsSync(budgetPath)) {
      return res.status(404).json({ success: false, error: 'Presupuesto no encontrado' });
    }
    
    const data = fs.readFileSync(budgetPath, 'utf-8');
    const budget = JSON.parse(data);
    
    res.json({ success: true, budget });
  } catch (error) {
    console.error('Error loading budget:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
