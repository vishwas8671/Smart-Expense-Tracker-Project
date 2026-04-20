export const fmtMoney = (n, currency = 'USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(n || 0));

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const CATEGORY_COLORS = {
  Food: '#10b981',
  Travel: '#3b82f6',
  Rent: '#f59e0b',
  Shopping: '#ec4899',
  Bills: '#8b5cf6',
  Health: '#ef4444',
  Entertainment: '#14b8a6',
  Other: '#64748b',
};
