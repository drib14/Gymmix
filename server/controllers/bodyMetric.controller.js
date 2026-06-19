const BodyMetric = require('../models/BodyMetric');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /body-metrics ──────────────────────────────────────
exports.getMetrics = async (req, res, next) => {
  try {
    const { from, to, page = 1, limit = 30 } = req.query;
    const query = { user: req.user._id };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    const total = await BodyMetric.countDocuments(query);
    const metrics = await BodyMetric.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    return sendPaginated(res, 'Body metrics fetched.', metrics, { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ── GET /body-metrics/latest ───────────────────────────────
exports.getLatest = async (req, res, next) => {
  try {
    const metric = await BodyMetric.findOne({ user: req.user._id }).sort({ date: -1 });
    return sendSuccess(res, 'Latest metric fetched.', { metric });
  } catch (err) { next(err); }
};

// ── POST /body-metrics ─────────────────────────────────────
exports.createMetric = async (req, res, next) => {
  try {
    const metric = new BodyMetric({ ...req.body, user: req.user._id });
    const user = await User.findById(req.user._id);
    if (user.height && metric.weight) metric.computeBMI(user.height);
    if (req.file) {
      metric.photo = req.file.path;
      metric.photoPublicId = req.file.filename;
    }
    await metric.save();
    // Update user's current weight
    if (metric.weight) await User.findByIdAndUpdate(req.user._id, { weight: metric.weight });
    return sendSuccess(res, 'Body metric recorded.', { metric }, 201);
  } catch (err) { next(err); }
};

// ── PUT /body-metrics/:id ──────────────────────────────────
exports.updateMetric = async (req, res, next) => {
  try {
    const metric = await BodyMetric.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!metric) return sendError(res, 'Metric not found.', 404);
    return sendSuccess(res, 'Metric updated.', { metric });
  } catch (err) { next(err); }
};

// ── DELETE /body-metrics/:id ───────────────────────────────
exports.deleteMetric = async (req, res, next) => {
  try {
    const metric = await BodyMetric.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!metric) return sendError(res, 'Metric not found.', 404);
    return sendSuccess(res, 'Metric deleted.');
  } catch (err) { next(err); }
};

// ── GET /body-metrics/trend ────────────────────────────────
exports.getTrend = async (req, res, next) => {
  try {
    const metrics = await BodyMetric.find({ user: req.user._id })
      .select('date weight bodyFatPercent bmi measurements.waist')
      .sort({ date: 1 })
      .limit(90);
    return sendSuccess(res, 'Trend data fetched.', { metrics });
  } catch (err) { next(err); }
};
