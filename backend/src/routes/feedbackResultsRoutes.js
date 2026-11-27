const router = require('express').Router();
const { authenticate, authorize, ROLES } = require('../middlewares/authMiddleware');
const controller = require('../controllers/feedbackController');

router.get('/', authenticate, authorize(ROLES.ADMIN), controller.listFeedback);
module.exports = router;
