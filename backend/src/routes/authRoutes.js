const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/login', ctrl.login);
router.post('/register', ctrl.register);
router.get('/me', authenticate, ctrl.me);

module.exports = router;