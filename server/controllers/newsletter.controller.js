const Newsletter = require('../models/Newsletter');
const { sendNewsletterWelcome, sendNewsletterBroadcast } = require('../services/email.service');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const crypto = require('crypto');

// ── POST /newsletter/subscribe ─────────────────────────────
exports.subscribe = async (req, res, next) => {
  try {
    const { email, firstName, source } = req.body;

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.isActive) return sendError(res, 'This email is already subscribed.', 409);
      // Re-subscribe
      existing.isActive = true;
      existing.unsubscribedAt = undefined;
      existing.firstName = firstName || existing.firstName;
      await existing.save();
      return sendSuccess(res, 'Welcome back! You\'ve been re-subscribed.');
    }

    const unsubscribeToken = crypto.randomUUID();
    const subscriber = await Newsletter.create({ email, firstName: firstName || '', source: source || 'landing', unsubscribeToken });

    await sendNewsletterWelcome({ to: email, firstName: firstName || '', unsubscribeToken });

    return sendSuccess(res, 'You\'re subscribed! Check your email for a confirmation.', {}, 201);
  } catch (err) { next(err); }
};

// ── POST /newsletter/unsubscribe ───────────────────────────
exports.unsubscribe = async (req, res, next) => {
  try {
    const { token } = req.query;
    const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
    if (!subscriber) return sendError(res, 'Invalid unsubscribe link.', 400);

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return sendSuccess(res, 'You\'ve been unsubscribed from the Gymmix newsletter.');
  } catch (err) { next(err); }
};

// ── ADMIN: GET /newsletter/subscribers ────────────────────
exports.getSubscribers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, active } = req.query;
    const query = {};
    if (active !== undefined) query.isActive = active === 'true';

    const total = await Newsletter.countDocuments(query);
    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return sendPaginated(res, 'Subscribers fetched.', subscribers, { page: parseInt(page), limit: parseInt(limit), total });
  } catch (err) { next(err); }
};

// ── ADMIN: POST /newsletter/broadcast ─────────────────────
exports.broadcast = async (req, res, next) => {
  try {
    const { subject, content } = req.body;
    const subscribers = await Newsletter.find({ isActive: true });
    if (!subscribers.length) return sendError(res, 'No active subscribers.', 400);

    const results = await sendNewsletterBroadcast({ subscribers, subject, content });
    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return sendSuccess(res, `Newsletter sent to ${sent} subscribers. ${failed} failed.`, { sent, failed });
  } catch (err) { next(err); }
};
