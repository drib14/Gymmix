const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/workoutPlan.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/public', ctrl.getPublicPlans);
router.get('/', ctrl.getPlans);
router.get('/:id', ctrl.getPlan);
router.post('/', ctrl.createPlan);
router.put('/:id', ctrl.updatePlan);
router.delete('/:id', ctrl.deletePlan);
router.post('/:id/clone', ctrl.clonePlan);

module.exports = router;
