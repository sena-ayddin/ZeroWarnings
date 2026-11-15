const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/feedbackController');

router.post('/', ctrl.createFeedback);
module.exports = router;
