const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');

const ObjectId = mongoose.Types.ObjectId;

function monthRange(monthStr) {
  // monthStr "YYYY-MM" -> [start, end)
  const now = new Date();
  const [y, m] = monthStr
    ? monthStr.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { start, end, key: `${y}-${String(m).padStart(2, '0')}` };
}

exports.summary = async (req, res, next) => {
  try {
    const { month } = req.query;
    const { start, end } = monthRange(month);
    const userId = new ObjectId(req.user.id);

    const [incomeAgg, expenseAgg] = await Promise.all([
      Income.aggregate([
        { $match: { user: userId, date: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpense = expenseAgg[0]?.total || 0;
    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      month: month || `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`,
    });
  } catch (err) {
    next(err);
  }
};

exports.trends = async (req, res, next) => {
  try {
    const months = Math.min(24, Math.max(1, parseInt(req.query.months || '6', 10)));
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));
    const userId = new ObjectId(req.user.id);

    const group = (col) =>
      col.aggregate([
        { $match: { user: userId, date: { $gte: start } } },
        {
          $group: {
            _id: { y: { $year: '$date' }, m: { $month: '$date' } },
            total: { $sum: '$amount' },
          },
        },
      ]);

    const [incomes, expenses] = await Promise.all([group(Income), group(Expense)]);
    const map = {};
    for (let i = 0; i < months; i++) {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      map[key] = { month: key, income: 0, expense: 0 };
    }
    for (const r of incomes) {
      const key = `${r._id.y}-${String(r._id.m).padStart(2, '0')}`;
      if (map[key]) map[key].income = r.total;
    }
    for (const r of expenses) {
      const key = `${r._id.y}-${String(r._id.m).padStart(2, '0')}`;
      if (map[key]) map[key].expense = r.total;
    }
    res.json({ items: Object.values(map) });
  } catch (err) {
    next(err);
  }
};

exports.byCategory = async (req, res, next) => {
  try {
    const { month } = req.query;
    const { start, end } = monthRange(month);
    const userId = new ObjectId(req.user.id);
    const items = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { _id: 0, category: '$_id', total: 1 } },
      { $sort: { total: -1 } },
    ]);
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.insights = async (req, res, next) => {
  try {
    const userId = new ObjectId(req.user.id);
    const { start: curStart, end: curEnd, key: curKey } = monthRange();
    const prev = new Date(Date.UTC(curStart.getUTCFullYear(), curStart.getUTCMonth() - 1, 1));
    const prevEnd = curStart;

    const [curByCat, prevByCat, budgets, curTotalAgg, prevTotalAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: curStart, $lt: curEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: prev, $lt: prevEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
      Budget.find({ user: userId, month: curKey }),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: curStart, $lt: curEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: prev, $lt: prevEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const curMap = Object.fromEntries(curByCat.map((r) => [r._id, r.total]));
    const prevMap = Object.fromEntries(prevByCat.map((r) => [r._id, r.total]));
    const insights = [];

    // Top category
    const top = curByCat.sort((a, b) => b.total - a.total)[0];
    if (top) {
      insights.push({
        type: 'top_category',
        severity: 'info',
        message: `Your highest spending category this month is ${top._id} ($${top.total.toFixed(2)}).`,
      });
    }

    // Month-over-month per category (>=25% increase)
    for (const [cat, total] of Object.entries(curMap)) {
      const prevTotal = prevMap[cat] || 0;
      if (prevTotal > 0) {
        const change = ((total - prevTotal) / prevTotal) * 100;
        if (change >= 25) {
          insights.push({
            type: 'overspend_mom',
            severity: 'warning',
            message: `You spent ${change.toFixed(0)}% more on ${cat} this month than last month.`,
          });
        }
      }
    }

    // Budget alerts
    for (const b of budgets) {
      const spent = curMap[b.category] || 0;
      const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      if (pct >= 100) {
        insights.push({
          type: 'budget_exceeded',
          severity: 'danger',
          message: `${b.category} budget exceeded: $${spent.toFixed(2)} / $${b.monthlyLimit.toFixed(2)}.`,
        });
      } else if (pct >= 80) {
        insights.push({
          type: 'budget_warning',
          severity: 'warning',
          message: `${b.category} is at ${pct.toFixed(0)}% of monthly budget.`,
        });
      }
    }

    // Overall MoM
    const cur = curTotalAgg[0]?.total || 0;
    const prv = prevTotalAgg[0]?.total || 0;
    if (prv > 0) {
      const diff = ((cur - prv) / prv) * 100;
      insights.push({
        type: 'total_mom',
        severity: diff >= 0 ? 'info' : 'success',
        message:
          diff >= 0
            ? `Total spending is up ${diff.toFixed(0)}% vs last month.`
            : `Nice — total spending is down ${Math.abs(diff).toFixed(0)}% vs last month.`,
      });
    }

    res.json({ items: insights });
  } catch (err) {
    next(err);
  }
};
