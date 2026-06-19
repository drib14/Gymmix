const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

// Verify access token
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) return sendError(res, 'Access denied. No token provided.', 401);

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshTokens -otp -otpExpiry');

    if (!user) return sendError(res, 'User not found.', 401);
    if (!user.isActive) return sendError(res, 'Your account has been suspended.', 403);

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return sendError(res, 'Token expired.', 401);
    if (error.name === 'JsonWebTokenError') return sendError(res, 'Invalid token.', 401);
    next(error);
  }
};

// Admin-only guard
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return sendError(res, 'Access denied. Admins only.', 403);
  }
  next();
};

// Subscription tier guard
const requireSubscription = (...tiers) => {
  return (req, res, next) => {
    if (!tiers.includes(req.user?.subscriptionTier)) {
      return sendError(res, `This feature requires a ${tiers.join(' or ')} subscription.`, 403);
    }
    next();
  };
};

// Verified email guard
const requireVerified = (req, res, next) => {
  if (!req.user?.isVerified) {
    return sendError(res, 'Please verify your email address first.', 403);
  }
  next();
};

module.exports = { protect, adminOnly, requireSubscription, requireVerified };
