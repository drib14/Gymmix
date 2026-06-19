const mongoose = require('mongoose');

const supportInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  },
  { timestamps: true }
);

supportInquirySchema.index({ email: 1 });
supportInquirySchema.index({ status: 1 });

module.exports = mongoose.model('SupportInquiry', supportInquirySchema);
