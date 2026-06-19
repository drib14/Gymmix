const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bodyMetric.controller');
const { protect } = require('../middleware/auth');
const { uploadProgress } = require('../middleware/upload');

router.use(protect);
router.get('/trend', ctrl.getTrend);
router.get('/latest', ctrl.getLatest);
router.get('/', ctrl.getMetrics);
router.post('/', uploadProgress.single('photo'), ctrl.createMetric);
router.put('/:id', ctrl.updateMetric);
router.delete('/:id', ctrl.deleteMetric);

module.exports = router;
