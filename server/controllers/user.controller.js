const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /users/me ─────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens -otp -otpExpiry');
    return sendSuccess(res, 'Profile fetched.', { user });
  } catch (err) { next(err); }
};

// ── PUT /users/me ─────────────────────────────────────────
exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ['firstName', 'lastName', 'bio', 'fitnessLevel', 'fitnessGoalSummary', 'dateOfBirth', 'gender', 'height', 'weight', 'city', 'country'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .select('-password -refreshTokens -otp -otpExpiry');

    return sendSuccess(res, 'Profile updated.', { user });
  } catch (err) { next(err); }
};

// ── PUT /users/me/avatar ──────────────────────────────────
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'No image file provided.', 400);

    const user = await User.findById(req.user._id);
    // Delete old avatar from Cloudinary
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
    }

    user.avatar = req.file.path;
    user.avatarPublicId = req.file.filename;
    await user.save();

    return sendSuccess(res, 'Avatar updated.', { avatar: user.avatar });
  } catch (err) { next(err); }
};

// ── DELETE /users/me/avatar ───────────────────────────────
exports.deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
    }
    user.avatar = '';
    user.avatarPublicId = '';
    await user.save();
    return sendSuccess(res, 'Avatar removed.');
  } catch (err) { next(err); }
};

// ── PUT /users/me/password ────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect.', 400);

    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return sendSuccess(res, 'Password changed. Please log in again.');
  } catch (err) { next(err); }
};

// ── DELETE /users/me ──────────────────────────────────────
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.avatarPublicId) await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
    user.isActive = false;
    user.refreshTokens = [];
    await user.save();
    return sendSuccess(res, 'Account deactivated successfully.');
  } catch (err) { next(err); }
};

// ── ADMIN: GET /users ─────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const query = search ? { $or: [{ email: new RegExp(search, 'i') }, { username: new RegExp(search, 'i') }] } : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshTokens -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return sendPaginated(res, 'Users fetched.', users, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ── ADMIN: PUT /users/:id/role ─────────────────────────────
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password -refreshTokens');
    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, `User role updated to ${role}.`, { user });
  } catch (err) { next(err); }
};

// ── ADMIN: PUT /users/:id/ban ──────────────────────────────
exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);
    user.isActive = !user.isActive;
    user.refreshTokens = [];
    await user.save();
    return sendSuccess(res, `User ${user.isActive ? 'unbanned' : 'banned'}.`, { isActive: user.isActive });
  } catch (err) { next(err); }
};
