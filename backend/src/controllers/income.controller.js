const Income = require('../models/Income');

exports.list = async (req, res, next) => {
  try {
    const items = await Income.find({ user: req.user.id }).sort({ date: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const income = await Income.create({ ...req.body, user: req.user.id });
    res.status(201).json(income);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json(income);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const r = await Income.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!r) return res.status(404).json({ message: 'Income not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
