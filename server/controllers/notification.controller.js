const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Internal helper — called by other controllers
const createNotification = async ({ recipient, type, title, message, icon, link, metadata }) => {
  try {
    const notification = await Notification.create({ recipient, type, title, message, icon: icon || 'bell', link: link || '', metadata: metadata || {} });

    // Emit via Socket.IO to user's room
    try {
      const io = getIO();
      io.to(`user:${recipient}`).emit('notification', notification);
    } catch (_) {
      // Socket might not be initialized in tests
    }

    return notification;
  } catch (err) {
    console.error('❌ Failed to create notification:', err.message);
  }
};

// ── GET /notifications ─────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, page = 1, limit = 20 } = req.query;
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    return res.status(200).json({ success: true, message: 'Notifications fetched.', data: { notifications, unreadCount }, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) { next(err); }
};

// ── PUT /notifications/:id/read ────────────────────────────
exports.markAsRead = async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!n) return sendError(res, 'Notification not found.', 404);
    return sendSuccess(res, 'Marked as read.', { notification: n });
  } catch (err) { next(err); }
};

// ── PUT /notifications/read-all ────────────────────────────
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    return sendSuccess(res, 'All notifications marked as read.');
  } catch (err) { next(err); }
};

// ── DELETE /notifications/:id ──────────────────────────────
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    return sendSuccess(res, 'Notification deleted.');
  } catch (err) { next(err); }
};

// ── DELETE /notifications/clear-all ───────────────────────
exports.clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    return sendSuccess(res, 'All notifications cleared.');
  } catch (err) { next(err); }
};

exports.createNotification = createNotification;
