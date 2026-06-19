const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    unsubscribeToken: { type: String, unique: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
    source: { type: String, enum: ['landing', 'footer', 'registration', 'admin'], default: 'landing' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isActive: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);
