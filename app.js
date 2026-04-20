const body = document.getElementById("items-body");
const template = document.getElementById("item-template");
const addItemBtn = document.getElementById("add-item");
const printBtn = document.getElementById("print");
const ivaInput = document.getElementById("iva");

const fmt = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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
  row.querySelector(".price").value = item.price ?? 0;

  attachRowEvents(row);
  body.appendChild(row);
  refreshTotals();
}

addItemBtn.addEventListener("click", () => addRow());
ivaInput.addEventListener("input", refreshTotals);
printBtn.addEventListener("click", () => window.print());

[
  { code: "ARTMOD", desc: "4869 - CUCHARA ALBAÑIL N° 8", qty: 2, price: 31650 },
  { code: "ARTMOD", desc: "4848 - PALA C/CORTO ANC", qty: 2, price: 78438.07 },
  { code: "ARTMOD", desc: "4850 - PALA C/CORTO CORAZÓN", qty: 2, price: 72626.25 },
].forEach(addRow);
