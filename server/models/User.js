const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    avatarPublicId: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    // OTP
    otp: { type: String },
    otpExpiry: { type: Date },
    // Profile
    bio: { type: String, default: '', maxlength: 500 },
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'elite'], default: 'beginner' },
    fitnessGoalSummary: { type: String, default: '' },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    // Location
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    // Subscription
    subscriptionTier: { type: String, enum: ['free', 'pro', 'elite'], default: 'free' },
    subscriptionExpiry: { type: Date },
    // Legal
    acceptedTerms: { type: Boolean, required: true, default: false },
    acceptedPrivacy: { type: Boolean, required: true, default: false },
    // Newsletter
    newsletterSubscribed: { type: Boolean, default: false },
    // Stats
    totalWorkouts: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastWorkoutDate: { type: Date },
    // Refresh tokens (stored hashed)
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Don't return password or tokens in JSON
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.otp;
  delete obj.otpExpiry;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
