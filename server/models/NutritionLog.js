const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 }, // g
  carbs: { type: Number, default: 0 }, // g
  fats: { type: Number, default: 0 }, // g
  fiber: { type: Number, default: 0 }, // g
  servingSize: { type: String, default: '100g' },
  quantity: { type: Number, default: 1 },
});

const nutritionLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'], default: 'snack' },
    items: [mealItemSchema],
    // Daily totals (computed)
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFats: { type: Number, default: 0 },
    totalFiber: { type: Number, default: 0 },
    waterMl: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-compute totals before save
nutritionLogSchema.pre('save', function (next) {
  const totals = this.items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories * item.quantity || 0),
      protein: acc.protein + (item.protein * item.quantity || 0),
      carbs: acc.carbs + (item.carbs * item.quantity || 0),
      fats: acc.fats + (item.fats * item.quantity || 0),
      fiber: acc.fiber + (item.fiber * item.quantity || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );
  this.totalCalories = Math.round(totals.calories);
  this.totalProtein = Math.round(totals.protein * 10) / 10;
  this.totalCarbs = Math.round(totals.carbs * 10) / 10;
  this.totalFats = Math.round(totals.fats * 10) / 10;
  this.totalFiber = Math.round(totals.fiber * 10) / 10;
  next();
});

nutritionLogSchema.index({ user: 1, date: -1 });
nutritionLogSchema.index({ user: 1, date: 1, mealType: 1 });

module.exports = mongoose.model('NutritionLog', nutritionLogSchema);
