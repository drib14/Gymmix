const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/nutrition.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/weekly-trend', ctrl.getWeeklyTrend);
router.get('/daily-summary', ctrl.getDailySummary);
router.get('/', ctrl.getLogs);
router.post('/', ctrl.createLog);
router.put('/:id', ctrl.updateLog);
router.delete('/:id', ctrl.deleteLog);

module.exports = router;
