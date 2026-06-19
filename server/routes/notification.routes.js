const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getNotifications);
router.put('/read-all', ctrl.markAllRead);
router.delete('/clear-all', ctrl.clearAll);
router.put('/:id/read', ctrl.markAsRead);
router.delete('/:id', ctrl.deleteNotification);

module.exports = router;
