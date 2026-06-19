const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/workoutLog.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats/summary', ctrl.getStatsSummary);
router.get('/', ctrl.getLogs);
router.get('/:id', ctrl.getLog);
router.post('/', ctrl.createLog);
router.put('/:id', ctrl.updateLog);
router.delete('/:id', ctrl.deleteLog);

module.exports = router;
