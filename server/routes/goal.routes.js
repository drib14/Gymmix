const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/goal.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getGoals);
router.get('/:id', ctrl.getGoal);
router.post('/', ctrl.createGoal);
router.put('/:id', ctrl.updateGoal);
router.delete('/:id', ctrl.deleteGoal);

module.exports = router;
