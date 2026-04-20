const router = require('express').Router();
const ctrl = require('../controllers/budget.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { budgetRules } = require('../validators');

router.use(auth);

router.get('/', ctrl.list);
router.post('/', budgetRules, validate, ctrl.upsert);
router.delete('/:id', ctrl.remove);

module.exports = router;
