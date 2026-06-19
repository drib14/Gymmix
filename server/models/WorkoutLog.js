const mongoose = require('mongoose');

const setLogSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  reps: { type: Number },
  weight: { type: Number }, // kg
  duration: { type: Number }, // seconds
  isCompleted: { type: Boolean, default: true },
  notes: { type: String, default: '' },
});

const exerciseLogSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  exerciseName: { type: String }, // snapshot
  sets: [setLogSchema],
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const workoutLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workoutPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan' },
    workoutPlanName: { type: String }, // snapshot
    dayName: { type: String },
    exercises: [exerciseLogSchema],
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    totalVolume: { type: Number, default: 0 }, // total weight lifted (kg × reps)
    totalSets: { type: Number, default: 0 },
    caloriesBurned: { type: Number },
    notes: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5 },
    mood: { type: String, enum: ['great', 'good', 'okay', 'tired', 'bad'] },
    musclesWorked: [{ type: String }],
  },
  { timestamps: true }
);

workoutLogSchema.index({ user: 1, startTime: -1 });
workoutLogSchema.index({ user: 1, workoutPlan: 1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
