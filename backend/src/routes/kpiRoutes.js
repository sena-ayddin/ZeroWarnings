const router = require('express').Router();
const ctrl = require('../controllers/kpiController');
const { authenticate, authorize, ROLES } = require('../middlewares/authMiddleware');

router.get('/', authenticate, authorize(ROLES.ADMIN), ctrl.getKpi);

module.exports = router;