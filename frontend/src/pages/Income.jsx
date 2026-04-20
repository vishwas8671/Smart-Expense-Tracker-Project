import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { IncomeAPI } from '../api/endpoints';
import Button from '../components/ui/Button';
import { Input, Label, Textarea } from '../components/ui/Input';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { fmtMoney, fmtDate } from '../utils/format';

const empty = { source: '', amount: '', date: new Date().toISOString().slice(0, 10), notes: '' };

export default function Income() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    setLoading(true);
    IncomeAPI.list().then((r) => setItems(r.items)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const monthTotal = (() => {
    const now = new Date();
    return items
      .filter((i) => {
        const d = new Date(i.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, i) => s + i.amount, 0);
  })();

  const openNew = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (i) => {
    setEditing(i);
    setForm({ source: i.source, amount: i.amount, date: new Date(i.date).toISOString().slice(0, 10), notes: i.notes || '' });
    setModalOpen(true);
  };

  const submit = async (ev) => {
    ev.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) await IncomeAPI.update(editing._id, payload);
      else await IncomeAPI.create(payload);
      toast.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this income entry?')) return;
    try { await IncomeAPI.remove(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Income</h1>
          <p className="text-sm text-slate-500">This month: <span className="font-semibold text-slate-800 dark:text-slate-100">{fmtMoney(monthTotal)}</span></p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add income</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All entries</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-5 py-3" colSpan={4}><Skeleton className="h-5 w-full" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">No income yet.</td></tr>
              ) : (
                items.map((i) => (
                  <tr key={i._id} className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 text-slate-500">{fmtDate(i.date)}</td>
                    <td className="px-5 py-3 font-medium">{i.source}</td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-600">{fmtMoney(i.amount)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => openEdit(i)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(i._id)} className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit income' : 'New income'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit}>{editing ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Source</Label>
            <Input required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <Input type="number" min="0" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
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
