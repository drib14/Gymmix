const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.use(protect);
router.get('/me', ctrl.getMe);
router.put('/me', ctrl.updateMe);
router.put('/me/avatar', uploadAvatar.single('avatar'), ctrl.updateAvatar);
router.delete('/me/avatar', ctrl.deleteAvatar);
router.put('/me/password', ctrl.changePassword);
router.delete('/me', ctrl.deleteAccount);

// Admin routes
router.get('/', adminOnly, ctrl.getAllUsers);
router.put('/:id/role', adminOnly, ctrl.updateUserRole);
router.put('/:id/ban', adminOnly, ctrl.banUser);

module.exports = router;
