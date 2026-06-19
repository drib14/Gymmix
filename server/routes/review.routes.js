const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/review.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', ctrl.getReviews);

router.use(protect);
router.post('/', ctrl.createReview);
router.put('/:id', ctrl.updateReview);
router.delete('/:id', ctrl.deleteReview);
router.post('/:id/helpful', ctrl.markHelpful);
router.put('/:id/approve', adminOnly, ctrl.approveReview);

module.exports = router;
