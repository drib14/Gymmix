const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tier: { type: String, enum: ['free', 'pro', 'elite'], default: 'free' },
    status: { type: String, enum: ['active', 'cancelled', 'expired', 'past_due', 'pending'], default: 'pending' },
    // Paymongo
    paymongoPaymentIntentId: { type: String },
    paymongoPaymentMethodId: { type: String },
    paymongoCustomerId: { type: String },
    // Billing
    amount: { type: Number }, // in centavos (PHP)
    currency: { type: String, default: 'PHP' },
    billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
    // Dates
    startDate: { type: Date },
    endDate: { type: Date },
    renewalDate: { type: Date },
    cancelledAt: { type: Date },
    // Payment history
    payments: [
      {
        amount: Number,
        paidAt: Date,
        paymentIntentId: String,
        status: String,
      },
    ],
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1, renewalDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
