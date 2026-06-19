const mongoose = require('mongoose');

const planExerciseSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '8-12' },
  restSeconds: { type: Number, default: 60 },
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 },
  weight: { type: Number }, // kg, optional default weight
  duration: { type: Number }, // seconds, for timed exercises
});

const workoutDaySchema = new mongoose.Schema({
  dayName: { type: String, default: 'Day' },
  dayNumber: { type: Number, required: true },
  focus: { type: String, default: '' }, // e.g. "Push", "Legs"
  exercises: [planExerciseSchema],
  estimatedDurationMinutes: { type: Number, default: 45 },
});

const workoutPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: false },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'elite'], default: 'beginner' },
    goal: { type: String, enum: ['strength', 'hypertrophy', 'endurance', 'weight_loss', 'general_fitness', 'sport'], default: 'general_fitness' },
    daysPerWeek: { type: Number, min: 1, max: 7, default: 3 },
    days: [workoutDaySchema],
    coverImage: { type: String, default: '' },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    timesCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workoutPlanSchema.index({ owner: 1, isActive: 1 });
workoutPlanSchema.index({ isPublic: 1, goal: 1, difficulty: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
