const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/summary', ctrl.summary);
router.get('/trends', ctrl.trends);
router.get('/by-category', ctrl.byCategory);
router.get('/insights', ctrl.insights);

module.exports = router;
