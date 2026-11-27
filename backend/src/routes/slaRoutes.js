const router = require('express').Router();
const { authenticate, authorize, ROLES } = require('../middlewares/authMiddleware');
const controller = require('../controllers/slaController');

router.get('/alerts', authenticate, authorize(ROLES.TECHNICIAN, ROLES.ADMIN), controller.getAlerts);
module.exports = router;
