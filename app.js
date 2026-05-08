const body = document.getElementById("items-body");
const template = document.getElementById("item-template");
const addItemBtn = document.getElementById("add-item");
const printBtn = document.getElementById("print");
const remitoBtn = document.getElementById("remito");
const ivaInput = document.getElementById("iva");
const newBudgetBtn = document.getElementById("new-budget");
const loadBudgetBtn = document.getElementById("load-budget");
const saveBudgetBtn = document.getElementById("save-budget");
const budgetListDialog = document.getElementById("budget-list-dialog");
const closeDialogBtn = document.getElementById("close-dialog");
const budgetNumberSpan = document.getElementById("budget-number");
const currentBudgetNameSpan = document.getElementById("current-budget-name");

const API_URL = window.location.origin;

const fmt = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

let currentBudgetId = null;

// Obtener datos actuales del presupuesto
function getCurrentBudgetData() {
  const rows = [...body.querySelectorAll("tr")];
  const items = rows.map(row => ({
    code: row.querySelector(".code").value,
    desc: row.querySelector(".desc").value,
    qty: parseFloat(row.querySelector(".qty").value) || 0,
    price: parseFloat(row.querySelector(".price").value) || 0,
  }));

  return {
    number: budgetNumberSpan.textContent,
    date: document.getElementById("fecha-hoy").textContent,
    iva: ivaInput.value,
    items: items,
    clientInfo: {
      name: document.querySelector('.party-info > div:first-child > p').textContent,
      address: document.querySelectorAll('.party-info > div:first-child > p')[1].textContent,
      city: document.querySelectorAll('.party-info > div:first-child > p')[2].textContent,
      document: document.querySelector('.party-info > div:last-child p span').textContent,
      cuit: document.querySelectorAll('.party-info > div:last-child p')[1].querySelector('span').textContent,
      condition: document.querySelectorAll('.party-info > div:last-child p')[3].querySelector('span').textContent,
      dueDate: document.getElementById("vencimiento-hoy").textContent,
    },
    observations: document.querySelector('.obs > p:last-child').textContent,
    savedAt: new Date().toISOString(),
  };
}

// Guardar presupuesto
async function saveBudget() {
  try {
    if (!currentBudgetId) {
      alert("Por favor crea un nuevo presupuesto primero");
      return;
    }

    const budgetData = getCurrentBudgetData();
    
    const response = await fetch(`${API_URL}/api/budgets/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        budgetNumber: currentBudgetId,
        data: budgetData
      })
    });

    const result = await response.json();
    
    if (result.success) {
      currentBudgetNameSpan.textContent = `Presupuesto: ${currentBudgetId}`;
      alert("Presupuesto guardado correctamente");
    } else {
      alert("Error al guardar: " + result.error);
    }
  } catch (error) {
    console.error("Error saving budget:", error);
    alert("Error al guardar el presupuesto: " + error.message);
  }
}

// Cargar presupuesto desde servidor
async function loadBudget(budgetNumber) {
  try {
    const response = await fetch(`${API_URL}/api/budgets/${budgetNumber}`);
    const result = await response.json();

    if (!result.success) {
      alert("Error al cargar: " + result.error);
      return;
    }

    const budgetData = result.budget;
    currentBudgetId = budgetNumber;
    budgetNumberSpan.textContent = budgetData.number;
    document.getElementById("fecha-hoy").textContent = budgetData.date;
    ivaInput.value = budgetData.iva;
    document.getElementById("vencimiento-hoy").textContent = budgetData.clientInfo.dueDate;

    // Cargar info del cliente
    const clientDivs = document.querySelectorAll('.party-info > div');
    clientDivs[0].children[0].textContent = budgetData.clientInfo.name;
    clientDivs[0].children[1].textContent = budgetData.clientInfo.address;
    clientDivs[0].children[2].textContent = budgetData.clientInfo.city;
    clientDivs[1].children[0].querySelector('span').textContent = budgetData.clientInfo.document;
    clientDivs[1].children[1].querySelector('span').textContent = budgetData.clientInfo.cuit;
    clientDivs[1].children[3].querySelector('span').textContent = budgetData.clientInfo.condition;

    // Observaciones
    document.querySelector('.obs > p:last-child').textContent = budgetData.observations;

    // Limpiar items existentes
    body.innerHTML = '';

    // Cargar items
    budgetData.items.forEach(addRow);

    currentBudgetNameSpan.textContent = `Presupuesto: ${budgetNumber}`;
    budgetListDialog.close();
  } catch (error) {
    console.error("Error loading budget:", error);
    alert("Error al cargar el presupuesto: " + error.message);
  }
}

// Mostrar lista de presupuestos guardados
async function showBudgetList() {
  try {
    const response = await fetch(`${API_URL}/api/budgets/list`);
    const result = await response.json();

    const listContainer = document.getElementById("budget-list");
    listContainer.innerHTML = '';

    if (!result.success || result.budgets.length === 0) {
      listContainer.innerHTML = '<p>No hay presupuestos guardados</p>';
    } else {
      result.budgets.forEach(budget => {
        const div = document.createElement('div');
        div.className = 'budget-item';
        const span = document.createElement('span');
        span.textContent = `${budget.number} - ${new Date(budget.date).toLocaleDateString('es-AR')}`;
        const btn = document.createElement('button');
        btn.textContent = 'Abrir';
        btn.addEventListener('click', () => loadBudget(budget.number));
        div.appendChild(span);
        div.appendChild(btn);
        listContainer.appendChild(div);
      });
    }

    budgetListDialog.showModal();
  } catch (error) {
    console.error("Error loading budget list:", error);
    alert("Error al cargar la lista de presupuestos: " + error.message);
  }
}

// Crear nuevo presupuesto
async function newBudget() {
  try {
    if (currentBudgetId && body.querySelectorAll("tr").length > 0) {
      if (!confirm("Hay un presupuesto actual. ¿Desea guardarlo antes de crear uno nuevo?")) {
        return;
      } else {
        await saveBudget();
      }
    }

    const response = await fetch(`${API_URL}/api/budgets/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success) {
      currentBudgetId = result.budgetNumber;
      currentBudgetNameSpan.textContent = '';
      body.innerHTML = '';
      budgetNumberSpan.textContent = result.budgetNumber;
      refreshTotals();
    } else {
      alert("Error al crear presupuesto: " + result.error);
    }
  } catch (error) {
    console.error("Error creating budget:", error);
    alert("Error al crear nuevo presupuesto: " + error.message);
  }
}

function today() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

document.getElementById("fecha-hoy").textContent = today();
document.getElementById("vencimiento-hoy").textContent = today();

function money(value) {
  return `$${fmt.format(value || 0)}`;
}

function toNum(value) {
  return Number.parseFloat(value) || 0;
}

function rowTotal(row) {
  const qty = toNum(row.querySelector(".qty").value);
  const price = toNum(row.querySelector(".price").value);
  return qty * price;
}

function refreshTotals() {
  const rows = [...body.querySelectorAll("tr")];
  let subtotal = 0;
  let qtyTotal = 0;

  rows.forEach((row) => {
    const qty = toNum(row.querySelector(".qty").value);
    const line = rowTotal(row);
    qtyTotal += qty;
    subtotal += line;
    row.querySelector(".line-total").textContent = money(line);
  });

  const iva = toNum(ivaInput.value) / 100;
  const tax = subtotal * iva;
  const total = subtotal + tax;

  document.getElementById("filas").textContent = rows.length;
  document.getElementById("cant-total").textContent = fmt.format(qtyTotal);
  document.getElementById("subtotal").textContent = money(subtotal);
  document.getElementById("impuestos").textContent = money(tax);
  document.getElementById("total").textContent = money(total);
}

function attachRowEvents(row) {
  row.querySelectorAll("input").forEach((i) => {
    i.addEventListener("input", refreshTotals);
  });

  row.querySelector(".remove").addEventListener("click", () => {
    row.remove();
    refreshTotals();
  });
}

function addRow(item = {}) {
  const row = template.content.firstElementChild.cloneNode(true);
  row.querySelector(".code").value = item.code ?? "ARTMOD";
  row.querySelector(".desc").value = item.desc ?? "Producto";
  row.querySelector(".qty").value = item.qty ?? 1;
  row.querySelector(".price").value = `${item.price ?? 0}`;
  
  attachRowEvents(row);
  body.appendChild(row);
  refreshTotals();
}

// Event listeners
newBudgetBtn.addEventListener("click", newBudget);
loadBudgetBtn.addEventListener("click", showBudgetList);
saveBudgetBtn.addEventListener("click", saveBudget);
closeDialogBtn.addEventListener("click", () => budgetListDialog.close());

addItemBtn.addEventListener("click", () => addRow());
ivaInput.addEventListener("input", refreshTotals);
printBtn.addEventListener("click", () => {
  const numeroPresupuesto = budgetNumberSpan.textContent;
  const originalTitle = document.title;
  document.title = "Presupuesto " + numeroPresupuesto;
  window.print();
  document.title = originalTitle;
});

remitoBtn.addEventListener("click", () => {
  const numeroPresupuesto = budgetNumberSpan.textContent;
  const originalTitle = document.title;
  const docLetter = document.querySelector('.doc-letter');
  const originalLetter = docLetter.textContent;
  const docTitle = document.querySelector('.doc-info h2');
  const originalTitleText = docTitle.textContent;
  const priceHeaders = document.querySelectorAll('th:nth-child(4), th:nth-child(5)');
  const priceCells = document.querySelectorAll('td:nth-child(4), td:nth-child(5)');
  const totalsSection = document.querySelector('.totals');

  // Cambiar a Remito
  docLetter.textContent = 'R';
  docTitle.textContent = docTitle.textContent.replace('Presupuesto', 'Remito');
  document.title = "Remito " + numeroPresupuesto;
  priceHeaders.forEach(th => th.style.display = 'none');
  priceCells.forEach(td => td.style.display = 'none');
  totalsSection.style.display = 'none';

  // Imprimir
  window.print();

  // Restaurar
  docLetter.textContent = originalLetter;
  docTitle.textContent = originalTitleText;
  document.title = originalTitle;
  priceHeaders.forEach(th => th.style.display = '');
  priceCells.forEach(td => td.style.display = '');
  totalsSection.style.display = '';
});

// Inicializar con nuevo presupuesto
newBudget();
