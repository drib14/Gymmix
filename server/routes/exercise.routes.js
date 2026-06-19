const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/exercise.controller');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadExercise } = require('../middleware/upload');

router.get('/filters/meta', ctrl.getFilterMeta);
router.get('/', ctrl.getExercises);
router.get('/:id', ctrl.getExercise);

router.use(protect);
router.post('/', adminOnly, uploadExercise.single('image'), ctrl.createExercise);
router.put('/:id', adminOnly, uploadExercise.single('image'), ctrl.updateExercise);
router.delete('/:id', adminOnly, ctrl.deleteExercise);

module.exports = router;
