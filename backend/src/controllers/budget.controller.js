const Budget = require('../models/Budget');

exports.list = async (req, res, next) => {
  try {
    const { month } = req.query;
    const filter = { user: req.user.id };
    if (month) filter.month = month;
    const items = await Budget.find(filter).sort({ category: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// Upsert: one budget per (user, category, month)
exports.upsert = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, category, month },
      { monthlyLimit },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
    res.status(201).json(budget);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const r = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!r) return res.status(404).json({ message: 'Budget not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
