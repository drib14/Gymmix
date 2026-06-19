const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['goal_achieved', 'workout_streak', 'subscription', 'system', 'newsletter', 'badge', 'reminder', 'admin'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String, default: 'bell' },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
