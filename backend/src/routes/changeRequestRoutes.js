const router = require('express').Router();
const ctrl = require('../controllers/changeRequestController');
const { authenticate, authorize, ROLES } = require('../middlewares/authMiddleware');

const { EMPLOYEE, TECHNICIAN, ADMIN } = ROLES;

router.use(authenticate); // tüm değişiklik talebi rotaları token ister

router.post('/', authorize(EMPLOYEE, TECHNICIAN, ADMIN), ctrl.createChangeRequest);
router.get('/', authorize(EMPLOYEE, TECHNICIAN, ADMIN), ctrl.listChangeRequests);
router.get('/:id', authorize(EMPLOYEE, TECHNICIAN, ADMIN), ctrl.getChangeRequest);
// Geçişe göre rol denetimi controller'da yapılır (onay/ret: Administrator, uygulama: Technician/Administrator)
router.patch('/:id/status', authorize(TECHNICIAN, ADMIN), ctrl.updateStatus);

module.exports = router;