const router = require('express').Router();
const ctrl = require('../controllers/ticketController');
const { authenticate, authorize, ROLES } = require('../middlewares/authMiddleware');

const { EMPLOYEE, TECHNICIAN, ADMIN } = ROLES;

router.use(authenticate); // tüm bilet rotaları token ister

router.post('/', authorize(EMPLOYEE, TECHNICIAN, ADMIN), ctrl.createTicket);
router.get('/', authorize(EMPLOYEE, TECHNICIAN, ADMIN), ctrl.listTickets);
router.get('/:id', authorize(EMPLOYEE, TECHNICIAN, ADMIN), ctrl.getTicket);

module.exports = router;