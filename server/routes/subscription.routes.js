const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/subscription.controller');
const { protect, adminOnly } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.get('/plans', ctrl.getPlans);
router.post('/webhook', ctrl.webhook); // No auth — Paymongo calls this

router.use(protect);
router.get('/my', ctrl.getMySubscription);
router.post('/checkout', paymentLimiter, ctrl.createCheckout);
router.post('/attach', ctrl.attachPayment);
router.post('/cancel', ctrl.cancelSubscription);

module.exports = router;
