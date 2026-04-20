import api from './client';

export const AuthAPI = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const ExpenseAPI = {
  list: (params) => api.get('/expenses', { params }).then((r) => r.data),
  create: (data) => api.post('/expenses', data).then((r) => r.data),
  update: (id, data) => api.put(`/expenses/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/expenses/${id}`).then((r) => r.data),
  exportCsvUrl: (params) => {
    const qs = new URLSearchParams(params || {}).toString();
    return `${api.defaults.baseURL}/expenses/export/csv${qs ? `?${qs}` : ''}`;
  },
};

export const IncomeAPI = {
  list: () => api.get('/income').then((r) => r.data),
  create: (data) => api.post('/income', data).then((r) => r.data),
  update: (id, data) => api.put(`/income/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/income/${id}`).then((r) => r.data),
};

export const BudgetAPI = {
  list: (month) => api.get('/budgets', { params: { month } }).then((r) => r.data),
  upsert: (data) => api.post('/budgets', data).then((r) => r.data),
  remove: (id) => api.delete(`/budgets/${id}`).then((r) => r.data),
};

export const DashboardAPI = {
  summary: (month) => api.get('/dashboard/summary', { params: { month } }).then((r) => r.data),
  trends: (months = 6) => api.get('/dashboard/trends', { params: { months } }).then((r) => r.data),
  byCategory: (month) =>
    api.get('/dashboard/by-category', { params: { month } }).then((r) => r.data),
  insights: () => api.get('/dashboard/insights').then((r) => r.data),
};

export const CATEGORIES = [
  'Food', 'Travel', 'Rent', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other',
];
