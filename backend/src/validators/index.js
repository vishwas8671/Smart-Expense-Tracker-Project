const { body } = require('express-validator');
const { CATEGORIES } = require('../models/Expense');

exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
];

exports.loginRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
];

exports.expenseRules = [
  body('title').trim().notEmpty().isLength({ max: 120 }),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn(CATEGORIES),
  body('date').optional().isISO8601().toDate(),
  body('notes').optional().isString().isLength({ max: 500 }),
];

exports.incomeRules = [
  body('source').trim().notEmpty().isLength({ max: 120 }),
  body('amount').isFloat({ min: 0 }),
  body('date').optional().isISO8601().toDate(),
  body('notes').optional().isString().isLength({ max: 500 }),
];

exports.budgetRules = [
  body('category').isIn(CATEGORIES),
  body('monthlyLimit').isFloat({ min: 0 }),
  body('month').matches(/^\d{4}-\d{2}$/).withMessage('month must be YYYY-MM'),
];
