const Expense = require('../models/Expense');

function buildFilter(req) {
  const filter = { user: req.user.id };
  const { category, from, to, minAmount, maxAmount, search } = req.query;
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }
  if (search) filter.title = { $regex: search, $options: 'i' };
  return filter;
}

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const filter = buildFilter(req);
    const [items, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
      Expense.countDocuments(filter),
    ]);
    res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user.id });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const r = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!r) return res.status(404).json({ message: 'Expense not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const items = await Expense.find(buildFilter(req)).sort({ date: -1 }).lean();
    const header = 'Date,Title,Category,Amount,Notes\n';
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = items
      .map((e) =>
        [new Date(e.date).toISOString().slice(0, 10), e.title, e.category, e.amount, e.notes]
          .map(escape)
          .join(',')
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
};
