const { createClient } = require('@supabase/supabase-js');

let _client = null;

function getClient() {
  if (!_client) {
    _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }
  return _client;
}

function ensureStorage() {}

async function generateBudgetNumber(now = new Date()) {
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateFolder = `${dd}${mm}${yyyy}`;

  const { data, error } = await getClient()
    .from('budgets')
    .select('budget_number')
    .like('budget_number', `${dateFolder}%`)
    .order('budget_number', { ascending: false })
    .limit(1);

  if (error) throw error;

  const counter =
    data && data.length > 0
      ? parseInt(data[0].budget_number.substring(8, 12), 10) + 1
      : 1;

  const counterFolder = String(counter).padStart(4, '0');
  return { number: `${dateFolder}${counterFolder}`, dateFolder, counterFolder };
}

async function saveBudget(budgetNumber, data) {
  const dateFolder = budgetNumber.substring(0, 8);

  const { error } = await getClient()
    .from('budgets')
    .upsert({ budget_number: budgetNumber, date_folder: dateFolder, data });

  if (error) throw error;
  return { budgetNumber };
}

async function loadBudget(budgetNumber) {
  const { data, error } = await getClient()
    .from('budgets')
    .select('data')
    .eq('budget_number', budgetNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data ? data.data : null;
}

async function listBudgets() {
  const { data, error } = await getClient()
    .from('budgets')
    .select('budget_number, date_folder, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    number: row.budget_number,
    date: row.created_at,
    path: `Storage/${row.date_folder}/${row.budget_number.substring(8, 12)}`,
  }));
}

module.exports = { ensureStorage, generateBudgetNumber, saveBudget, loadBudget, listBudgets };
