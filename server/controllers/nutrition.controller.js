const NutritionLog = require('../models/NutritionLog');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /nutrition ─────────────────────────────────────────
exports.getLogs = async (req, res, next) => {
  try {
    const { date, from, to, page = 1, limit = 30 } = req.query;
    const query = { user: req.user._id };

    if (date) {
      const d = new Date(date);
      query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    } else if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const total = await NutritionLog.countDocuments(query);
    const logs = await NutritionLog.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return sendPaginated(res, 'Nutrition logs fetched.', logs, {
      page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
};

// ── GET /nutrition/daily-summary ───────────────────────────
exports.getDailySummary = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const logs = await NutritionLog.find({ user: req.user._id, date: { $gte: startOfDay, $lte: endOfDay } });

    const summary = logs.reduce((acc, log) => ({
      calories: acc.calories + log.totalCalories,
      protein: acc.protein + log.totalProtein,
      carbs: acc.carbs + log.totalCarbs,
      fats: acc.fats + log.totalFats,
      fiber: acc.fiber + log.totalFiber,
      water: acc.water + log.waterMl,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, water: 0 });

    return sendSuccess(res, 'Daily summary fetched.', { summary, meals: logs });
  } catch (err) { next(err); }
};

// ── POST /nutrition ─────────────────────────────────────────
exports.createLog = async (req, res, next) => {
  try {
    const log = await NutritionLog.create({ ...req.body, user: req.user._id });
    return sendSuccess(res, 'Meal logged.', { log }, 201);
  } catch (err) { next(err); }
};

// ── PUT /nutrition/:id ──────────────────────────────────────
exports.updateLog = async (req, res, next) => {
  try {
    const log = await NutritionLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!log) return sendError(res, 'Log not found.', 404);
    return sendSuccess(res, 'Log updated.', { log });
  } catch (err) { next(err); }
};

// ── DELETE /nutrition/:id ───────────────────────────────────
exports.deleteLog = async (req, res, next) => {
  try {
    const log = await NutritionLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) return sendError(res, 'Log not found.', 404);
    return sendSuccess(res, 'Log deleted.');
  } catch (err) { next(err); }
};

// ── GET /nutrition/weekly-trend ────────────────────────────
exports.getWeeklyTrend = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trend = await NutritionLog.aggregate([
      { $match: { user: req.user._id, date: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, calories: { $sum: '$totalCalories' }, protein: { $sum: '$totalProtein' }, carbs: { $sum: '$totalCarbs' }, fats: { $sum: '$totalFats' } } },
      { $sort: { _id: 1 } },
    ]);

    return sendSuccess(res, 'Weekly trend fetched.', { trend });
  } catch (err) { next(err); }
};
