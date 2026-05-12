import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from '../src/app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storageRoot = join(__dirname, '..', 'Storage');

function cleanupTestBudgets() {
  if (!fs.existsSync(storageRoot)) return;
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const dateFolder = join(storageRoot, `${dd}${mm}${yyyy}`);
  if (fs.existsSync(dateFolder)) fs.rmSync(dateFolder, { recursive: true, force: true });
}

describe('API', () => {
  beforeEach(() => cleanupTestBudgets());

  it('should complete auth + budget flow', async () => {
    const { app } = createApp();

    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'presu123' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);

    const token = loginRes.body.token;

    const newRes = await request(app)
      .post('/api/budgets/new')
      .set('Authorization', `Bearer ${token}`);

    expect(newRes.status).toBe(200);
    expect(newRes.body.budgetNumber).toMatch(/^\d{12}$/);

    const payload = {
      budgetNumber: newRes.body.budgetNumber,
      data: {
        number: newRes.body.budgetNumber,
        clientInfo: { name: 'Cliente Test' },
      },
    };

    const saveRes = await request(app)
      .post('/api/budgets/save')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);
    expect(saveRes.status).toBe(200);

    const listRes = await request(app)
      .get('/api/budgets/list')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.budgets.some((b) => b.number === newRes.body.budgetNumber)).toBe(true);
  });

  it('should return normalized errors for invalid payload', async () => {
    const { app } = createApp();
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'presu123' });

    const token = loginRes.body.token;

    const res = await request(app)
      .post('/api/budgets/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ data: { number: '123' } });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });
});
