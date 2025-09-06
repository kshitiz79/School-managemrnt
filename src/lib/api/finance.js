import { httpClient as api } from '../httpClient'

export const financeApi = {
  // Expense Heads
  getExpenseHeads: () => api.get('/finance/expense-heads'),
  addExpenseHead: data => api.post('/finance/expense-heads', data),
  updateExpenseHead: (id, data) =>
    api.put(`/finance/expense-heads/${id}`, data),
  deleteExpenseHead: id => api.delete(`/finance/expense-heads/${id}`),

  // Income Heads
  getIncomeHeads: () => api.get('/finance/income-heads'),
  addIncomeHead: data => api.post('/finance/income-heads', data),
  updateIncomeHead: (id, data) => api.put(`/finance/income-heads/${id}`, data),
  deleteIncomeHead: id => api.delete(`/finance/income-heads/${id}`),

  // Expenses
  addExpense: data =>
    api.post('/finance/expenses', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  searchExpenses: filters => api.get('/finance/expenses', { params: filters }),
  getExpense: id => api.get(`/finance/expenses/${id}`),
  updateExpense: (id, data) =>
    api.put(`/finance/expenses/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteExpense: id => api.delete(`/finance/expenses/${id}`),

  // Incomes
  addIncome: data =>
    api.post('/finance/incomes', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  searchIncomes: filters => api.get('/finance/incomes', { params: filters }),
  getIncome: id => api.get(`/finance/incomes/${id}`),
  updateIncome: (id, data) =>
    api.put(`/finance/incomes/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteIncome: id => api.delete(`/finance/incomes/${id}`),

  // Reports
  getProfitLossData: dateRange =>
    api.get('/finance/profit-loss', { params: dateRange }),
  getMonthlySnapshot: (year, month) =>
    api.get('/finance/monthly-snapshot', {
      params: { year, month },
    }),
  getFinancialSummary: dateRange =>
    api.get('/finance/summary', { params: dateRange }),

  // Charts Data
  getIncomeChartData: dateRange =>
    api.get('/finance/charts/income', { params: dateRange }),
  getExpenseChartData: dateRange =>
    api.get('/finance/charts/expenses', { params: dateRange }),
  getComparisonChartData: dateRange =>
    api.get('/finance/charts/comparison', { params: dateRange }),
}
