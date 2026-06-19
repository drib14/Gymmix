const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    instructions: [{ type: String }],
    muscleGroups: [{ type: String, enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'core', 'abs', 'quads', 'hamstrings', 'glutes', 'calves', 'full_body', 'cardio'] }],
    primaryMuscle: { type: String },
    equipment: { type: String, enum: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'resistance_band', 'smith_machine', 'pull_up_bar', 'bench', 'none'], default: 'none' },
    difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'elite'], default: 'beginner' },
    category: { type: String, enum: ['strength', 'hypertrophy', 'endurance', 'flexibility', 'cardio', 'sport'], default: 'strength' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    // Default recommendations
    defaultSets: { type: Number, default: 3 },
    defaultReps: { type: String, default: '8-12' },
    defaultRestSeconds: { type: Number, default: 60 },
    // Metadata
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String }],
    // Stats aggregated
    timesUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

exerciseSchema.index({ name: 'text', description: 'text', tags: 'text' });
exerciseSchema.index({ muscleGroups: 1, difficultyLevel: 1, equipment: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
