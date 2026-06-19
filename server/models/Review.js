const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    category: { type: String, enum: ['app', 'workout_plan', 'exercise', 'general'], default: 'general' },
    targetId: { type: mongoose.Schema.Types.ObjectId }, // WorkoutPlan or Exercise id
    isApproved: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, category: 1, targetId: 1 });
reviewSchema.index({ isApproved: 1, isPublic: 1, rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);
