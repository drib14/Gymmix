const User = require('../models/User');
const Newsletter = require('../models/Newsletter');
const { generateTokens, generateOTP } = require('../utils/generateTokens');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/email.service');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ── POST /auth/register ─────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password, acceptedTerms, acceptedPrivacy, newsletterSubscribed } = req.body;

    if (!acceptedTerms || !acceptedPrivacy) {
      return sendError(res, 'You must accept the Terms of Service and Privacy Policy.', 422);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return sendError(res, 'Email already in use.', 409);

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return sendError(res, 'Username already taken.', 409);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
      acceptedTerms,
      acceptedPrivacy,
      newsletterSubscribed: !!newsletterSubscribed,
      otp,
      otpExpiry,
    });

    // Send OTP email
    await sendOTPEmail({ to: email, name: firstName, otp, type: 'verify' });

    // Optionally subscribe to newsletter
    if (newsletterSubscribed) {
      await Newsletter.findOneAndUpdate(
        { email },
        { email, firstName, isActive: true, source: 'registration', user: user._id, unsubscribeToken: crypto.randomUUID() },
        { upsert: true, new: true }
      );
    }

    return sendSuccess(res, 'Registration successful! Please check your email for the verification OTP.', { userId: user._id }, 201);
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/verify-otp ────────────────────────────────
exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return sendError(res, 'User not found.', 404);
    if (user.isVerified) return sendError(res, 'Email already verified.', 400);
    if (user.otp !== otp) return sendError(res, 'Invalid OTP.', 400);
    if (new Date() > user.otpExpiry) return sendError(res, 'OTP has expired. Please request a new one.', 400);

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    await sendWelcomeEmail({ to: user.email, name: user.firstName });

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    user.refreshTokens.push(refreshToken);
    await user.save();

    return sendSuccess(res, 'Email verified successfully! Welcome to Gymmix.', {
      accessToken,
      refreshToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/resend-otp ────────────────────────────────
exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return sendError(res, 'User not found.', 404);
    if (user.isVerified) return sendError(res, 'Email already verified.', 400);

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail({ to: user.email, name: user.firstName, otp, type: 'verify' });
    return sendSuccess(res, 'OTP resent successfully. Check your email.');
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/login ─────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return sendError(res, 'Invalid email or password.', 401);
    if (!user.isActive) return sendError(res, 'Your account has been suspended. Contact support.', 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 'Invalid email or password.', 401);

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Keep max 5 refresh tokens per user
    if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
    user.refreshTokens.push(refreshToken);
    await user.save();

    return sendSuccess(res, 'Login successful!', {
      accessToken,
      refreshToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/refresh ───────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, 'Refresh token required.', 401);

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return sendError(res, 'Invalid refresh token.', 401);
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    const tokens = generateTokens(user._id, user.role);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return sendSuccess(res, 'Token refreshed.', tokens);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return sendError(res, 'Invalid or expired refresh token.', 401);
    }
    next(err);
  }
};

// ── POST /auth/logout ────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const decoded = jwt.decode(refreshToken);
      if (decoded?.id) {
        await User.findByIdAndUpdate(decoded.id, { $pull: { refreshTokens: refreshToken } });
      }
    }
    return sendSuccess(res, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/forgot-password ───────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent user enumeration
    if (!user) return sendSuccess(res, 'If that email exists, a reset OTP has been sent.');

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail({ to: email, name: user.firstName, otp, type: 'reset' });
    return sendSuccess(res, 'Password reset OTP sent to your email.', { userId: user._id });
  } catch (err) {
    next(err);
  }
};

// ── POST /auth/reset-password ────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) return sendError(res, 'User not found.', 404);
    if (user.otp !== otp) return sendError(res, 'Invalid OTP.', 400);
    if (new Date() > user.otpExpiry) return sendError(res, 'OTP has expired.', 400);

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return sendSuccess(res, 'Password reset successful. Please log in with your new password.');
  } catch (err) {
    next(err);
  }
};
