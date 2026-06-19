const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/newsletter.controller');
const { protect, adminOnly } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/subscribe', [body('email').isEmail()], validate, ctrl.subscribe);
router.get('/unsubscribe', ctrl.unsubscribe);

router.use(protect);
router.get('/subscribers', adminOnly, ctrl.getSubscribers);
router.post('/broadcast', adminOnly, [body('subject').notEmpty(), body('content').notEmpty()], validate, ctrl.broadcast);

module.exports = router;
