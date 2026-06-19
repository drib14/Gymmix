const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analytics.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', ctrl.getDashboard);
router.get('/workout-frequency', ctrl.getWorkoutFrequency);
router.get('/platform', adminOnly, ctrl.getPlatformStats);

module.exports = router;
