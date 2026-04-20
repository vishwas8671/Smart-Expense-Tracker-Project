const router = require('express').Router();
const ctrl = require('../controllers/income.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { incomeRules } = require('../validators');

router.use(auth);

router.get('/', ctrl.list);
router.post('/', incomeRules, validate, ctrl.create);
router.put('/:id', incomeRules, validate, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
