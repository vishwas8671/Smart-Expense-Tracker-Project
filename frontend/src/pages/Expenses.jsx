import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Download, Search } from 'lucide-react';
import { ExpenseAPI, CATEGORIES } from '../api/endpoints';
import Button from '../components/ui/Button';
import { Input, Select, Label, Textarea } from '../components/ui/Input';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { fmtMoney, fmtDate } from '../utils/format';

const empty = { title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), notes: '' };

export default function Expenses() {
  const [filters, setFilters] = useState({ search: '', category: '', from: '', to: '', minAmount: '', maxAmount: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const params = useMemo(() => {
    const p = { page, limit: 10 };
    Object.entries(filters).forEach(([k, v]) => { if (v) p[k] = v; });
    return p;
  }, [filters, page]);

  const load = () => {
    setLoading(true);
    ExpenseAPI.list(params).then(setData).finally(() => setLoading(false));
  };

  useEffect(load, [params]);

  const openNew = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (e) => {
    setEditing(e);
    setForm({
      title: e.title, amount: e.amount, category: e.category,
      date: new Date(e.date).toISOString().slice(0, 10), notes: e.notes || '',
    });
    setModalOpen(true);
  };

  const submit = async (ev) => {
    ev.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) await ExpenseAPI.update(editing._id, payload);
      else await ExpenseAPI.create(payload);
      toast.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await ExpenseAPI.remove(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const exportCsv = () => {
    const url = ExpenseAPI.exportCsvUrl(params);
    const token = localStorage.getItem('token');
    // open with auth header via fetch -> blob
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'expenses.csv';
        a.click();
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-sm text-slate-500">{data.total} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
          <Button onClick={openNew}><Plus className="h-4 w-4" /> Add expense</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            <div className="col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-8"
                  placeholder="Search by title…"
                  value={filters.search}
                  onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }}
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={filters.category} onChange={(e) => { setPage(1); setFilters({ ...filters, category: e.target.value }); }}>
                <option value="">All</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <Label>From</Label>
              <Input type="date" value={filters.from} onChange={(e) => { setPage(1); setFilters({ ...filters, from: e.target.value }); }} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={filters.to} onChange={(e) => { setPage(1); setFilters({ ...filters, to: e.target.value }); }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Min $</Label>
                <Input type="number" value={filters.minAmount} onChange={(e) => { setPage(1); setFilters({ ...filters, minAmount: e.target.value }); }} />
              </div>
              <div>
                <Label>Max $</Label>
                <Input type="number" value={filters.maxAmount} onChange={(e) => { setPage(1); setFilters({ ...filters, maxAmount: e.target.value }); }} />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-5 py-3" colSpan={5}><Skeleton className="h-5 w-full" /></td>
                  </tr>
                ))
              ) : data.items.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No expenses found.</td></tr>
              ) : (
                data.items.map((e) => (
                  <tr key={e._id} className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 text-slate-500">{fmtDate(e.date)}</td>
                    <td className="px-5 py-3 font-medium">{e.title}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{e.category}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">{fmtMoney(e.amount)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => openEdit(e)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(e._id)} className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm dark:border-slate-800">
            <span className="text-slate-500">Page {page} of {data.pages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button size="sm" variant="secondary" disabled={page === data.pages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit expense' : 'New expense'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit}>{editing ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <Input type="number" min="0" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
