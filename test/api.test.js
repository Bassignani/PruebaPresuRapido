const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const { createApp } = require('../src/app');

const storageRoot = path.join(__dirname, '..', 'Storage');

function cleanupTestBudgets() {
  if (!fs.existsSync(storageRoot)) return;

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const dateFolder = path.join(storageRoot, `${dd}${mm}${yyyy}`);

  if (fs.existsSync(dateFolder)) {
    fs.rmSync(dateFolder, { recursive: true, force: true });
  }
}

test('API auth + budget flow works end-to-end', async (t) => {
  cleanupTestBudgets();

  const { app } = createApp();
  const server = app.listen(0);

  t.after(() => {
    server.close();
    cleanupTestBudgets();
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const loginRes = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'presu123' }),
  });

  assert.equal(loginRes.status, 200);
  const login = await loginRes.json();
  assert.equal(login.success, true);
  assert.ok(login.token);

  const token = login.token;

  const newRes = await fetch(`${baseUrl}/api/budgets/new`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(newRes.status, 200);
  const created = await newRes.json();
  assert.equal(created.success, true);
  assert.match(created.budgetNumber, /^\d{12}$/);

  const payload = {
    budgetNumber: created.budgetNumber,
    data: {
      number: created.budgetNumber,
      date: '11/05/2026',
      iva: '21',
      items: [],
      clientInfo: {
        name: 'Cliente Test',
        address: 'Calle 1',
        city: 'Ciudad',
        document: 'DNI',
        cuit: '20-00000000-0',
        condition: 'Responsable Inscripto',
        dueDate: '11/06/2026',
      },
      observations: 'obs test',
      savedAt: '2026-05-11T00:00:00.000Z',
    },
  };

  const saveRes = await fetch(`${baseUrl}/api/budgets/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  assert.equal(saveRes.status, 200);
  const save = await saveRes.json();
  assert.equal(save.success, true);

  const listRes = await fetch(`${baseUrl}/api/budgets/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(listRes.status, 200);
  const list = await listRes.json();
  assert.equal(list.success, true);
  assert.ok(list.budgets.some((b) => b.number === created.budgetNumber));

  const getRes = await fetch(`${baseUrl}/api/budgets/${created.budgetNumber}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(getRes.status, 200);
  const loaded = await getRes.json();
  assert.equal(loaded.success, true);
  assert.equal(loaded.budget.number, created.budgetNumber);
  assert.equal(loaded.budget.clientInfo.name, 'Cliente Test');
});

test('Protected routes reject missing token', async (t) => {
  const { app } = createApp();
  const server = app.listen(0);

  t.after(() => server.close());

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const res = await fetch(`${baseUrl}/api/budgets/list`);
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.success, false);
});
