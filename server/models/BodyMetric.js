const mongoose = require('mongoose');

const bodyMetricSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true, default: Date.now },
    weight: { type: Number }, // kg
    bodyFatPercent: { type: Number }, // %
    muscleMassKg: { type: Number },
    bmi: { type: Number },
    // Body measurements in cm
    measurements: {
      neck: { type: Number },
      chest: { type: Number },
      leftBicep: { type: Number },
      rightBicep: { type: Number },
      waist: { type: Number },
      hips: { type: Number },
      leftThigh: { type: Number },
      rightThigh: { type: Number },
      leftCalf: { type: Number },
      rightCalf: { type: Number },
    },
    notes: { type: String, default: '' },
    photo: { type: String, default: '' }, // Progress photo URL
    photoPublicId: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-compute BMI if height available
bodyMetricSchema.methods.computeBMI = function (heightCm) {
  if (this.weight && heightCm) {
    const heightM = heightCm / 100;
    this.bmi = Math.round((this.weight / (heightM * heightM)) * 10) / 10;
  }
};

bodyMetricSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('BodyMetric', bodyMetricSchema);
