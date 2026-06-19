const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'strength', 'endurance', 'body_fat', 'workout_frequency', 'custom'],
      required: true,
    },
    // Target
    targetValue: { type: Number }, // e.g. 70 (kg), 15 (% bf), 5 (workouts/week)
    targetUnit: { type: String, default: '' }, // kg, %, workouts/week
    startValue: { type: Number },
    currentValue: { type: Number },
    // Deadline
    deadline: { type: Date },
    // Status
    status: { type: String, enum: ['active', 'completed', 'paused', 'abandoned'], default: 'active' },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    // Achievement
    achievedAt: { type: Date },
    // Notes
    notes: { type: String, default: '' },
    // Milestones
    milestones: [
      {
        label: String,
        value: Number,
        achievedAt: Date,
        isAchieved: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

// Auto-compute progress
goalSchema.methods.updateProgress = function () {
  if (this.startValue !== undefined && this.targetValue !== undefined && this.currentValue !== undefined) {
    const total = Math.abs(this.targetValue - this.startValue);
    const achieved = Math.abs(this.currentValue - this.startValue);
    if (total === 0) {
      this.progressPercent = 100;
    } else {
      this.progressPercent = Math.min(100, Math.round((achieved / total) * 100));
    }
    if (this.progressPercent >= 100) {
      this.status = 'completed';
      this.achievedAt = new Date();
    }
  }
};

goalSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);
