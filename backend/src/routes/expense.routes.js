const router = require('express').Router();
const ctrl = require('../controllers/expense.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { expenseRules } = require('../validators');

router.use(auth);

router.get('/', ctrl.list);
router.get('/export/csv', ctrl.exportCsv);
router.post('/', expenseRules, validate, ctrl.create);
router.put('/:id', expenseRules, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
