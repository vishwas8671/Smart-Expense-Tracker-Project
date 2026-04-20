import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { BudgetAPI, DashboardAPI, CATEGORIES } from '../api/endpoints';
import Button from '../components/ui/Button';
import { Input, Select, Label } from '../components/ui/Input';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { fmtMoney, currentMonthKey } from '../utils/format';

export default function Budgets() {
  const month = currentMonthKey();
  const [budgets, setBudgets] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Food', monthlyLimit: '' });

  const load = () => {
    setLoading(true);
    Promise.all([BudgetAPI.list(month), DashboardAPI.byCategory(month)])
      .then(([b, c]) => { setBudgets(b.items); setByCategory(c.items); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const spentMap = Object.fromEntries(byCategory.map((r) => [r.category, r.total]));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await BudgetAPI.upsert({ ...form, monthlyLimit: Number(form.monthlyLimit), month });
      toast.success('Budget saved');
      setOpen(false);
      setForm({ category: 'Food', monthlyLimit: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try { await BudgetAPI.remove(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Budgets</h1>
          <p className="text-sm text-slate-500">Monthly category budgets for {month}</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Set budget</Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
      ) : budgets.length === 0 ? (
        <Card><CardBody className="py-10 text-center text-slate-500">No budgets set for this month yet.</CardBody></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => {
            const spent = spentMap[b.category] || 0;
            const pct = b.monthlyLimit > 0 ? Math.min(100, (spent / b.monthlyLimit) * 100) : 0;
            const overage = spent > b.monthlyLimit;
            const color = overage ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
            return (
              <Card key={b._id}>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>{b.category}</CardTitle>
                  <button onClick={() => remove(b._id)} className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardHeader>
                <CardBody>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-semibold">{fmtMoney(spent)}</div>
                    <div className="text-sm text-slate-500">/ {fmtMoney(b.monthlyLimit)}</div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className={`mt-2 text-xs ${overage ? 'text-red-600' : 'text-slate-500'}`}>
                    {overage
                      ? `Over budget by ${fmtMoney(spent - b.monthlyLimit)}`
                      : `${pct.toFixed(0)}% used`}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Set monthly budget"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Save</Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label>Monthly limit ($)</Label>
            <Input type="number" min="0" step="0.01" required value={form.monthlyLimit} onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })} />
          </div>
          <p className="text-xs text-slate-500">Setting a budget for a category that already exists this month will update it.</p>
        </form>
      </Modal>
    </div>
  );
}
