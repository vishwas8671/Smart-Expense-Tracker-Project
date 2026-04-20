import { useEffect, useState } from 'react';
import { Wallet, TrendingDown, TrendingUp, AlertCircle, Lightbulb, CheckCircle2 } from 'lucide-react';
import { DashboardAPI } from '../api/endpoints';
import { Card, CardBody, CardHeader, CardTitle } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import TrendsChart from '../components/charts/TrendsChart';
import CategoryChart from '../components/charts/CategoryChart';
import { fmtMoney, currentMonthKey } from '../utils/format';

const severityIcon = {
  info: Lightbulb,
  warning: AlertCircle,
  danger: AlertCircle,
  success: CheckCircle2,
};
const severityClass = {
  info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
  danger: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
};

function StatCard({ title, value, icon: Icon, accent }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
          <div className={`grid h-10 w-10 place-items-center rounded-lg ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const month = currentMonthKey();
    Promise.all([
      DashboardAPI.summary(month),
      DashboardAPI.trends(6),
      DashboardAPI.byCategory(month),
      DashboardAPI.insights(),
    ])
      .then(([s, t, c, i]) => {
        setSummary(s);
        setTrends(t.items);
        setByCategory(c.items);
        setInsights(i.items);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-80" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview for {summary?.month}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Income"
          value={fmtMoney(summary?.totalIncome)}
          icon={TrendingUp}
          accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        />
        <StatCard
          title="Total Expenses"
          value={fmtMoney(summary?.totalExpense)}
          icon={TrendingDown}
          accent="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        />
        <StatCard
          title="Balance"
          value={fmtMoney(summary?.balance)}
          icon={Wallet}
          accent="bg-brand-100 text-brand-700 dark:bg-brand-600/20 dark:text-brand-500"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Income vs Expenses (last 6 months)</CardTitle></CardHeader>
          <CardBody><TrendsChart data={trends} /></CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>By category</CardTitle></CardHeader>
          <CardBody>
            {byCategory.length ? (
              <CategoryChart data={byCategory} />
            ) : (
              <p className="text-sm text-slate-500">No expenses yet this month.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Smart insights</CardTitle></CardHeader>
        <CardBody>
          {insights.length === 0 ? (
            <p className="text-sm text-slate-500">No insights yet — add some transactions to see suggestions.</p>
          ) : (
            <ul className="space-y-2">
              {insights.map((i, idx) => {
                const Icon = severityIcon[i.severity] || Lightbulb;
                return (
                  <li key={idx} className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${severityClass[i.severity] || severityClass.info}`}>
                    <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{i.message}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
