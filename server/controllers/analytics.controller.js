const WorkoutLog = require('../models/WorkoutLog');
const NutritionLog = require('../models/NutritionLog');
const BodyMetric = require('../models/BodyMetric');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');

// ── GET /analytics/dashboard ───────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [user, recentWorkouts, weeklyWorkouts, workoutsByMuscle, monthlyVolume, latestMetric, activeGoals, weeklyCalories] = await Promise.all([
      User.findById(userId).select('totalWorkouts currentStreak longestStreak lastWorkoutDate subscriptionTier'),
      WorkoutLog.find({ user: userId }).sort({ startTime: -1 }).limit(5).populate('exercises.exercise', 'name'),
      WorkoutLog.find({ user: userId, startTime: { $gte: sevenDaysAgo } }),
      WorkoutLog.aggregate([{ $match: { user: userId, startTime: { $gte: thirtyDaysAgo } } }, { $unwind: '$musclesWorked' }, { $group: { _id: '$musclesWorked', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      WorkoutLog.aggregate([{ $match: { user: userId, startTime: { $gte: thirtyDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }, volume: { $sum: '$totalVolume' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      BodyMetric.findOne({ user: userId }).sort({ date: -1 }),
      Goal.find({ user: userId, status: 'active' }).limit(5),
      NutritionLog.aggregate([{ $match: { user: userId, date: { $gte: sevenDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, calories: { $sum: '$totalCalories' } } }, { $sort: { _id: 1 } }]),
    ]);

    return sendSuccess(res, 'Dashboard data fetched.', {
      user: { totalWorkouts: user.totalWorkouts, currentStreak: user.currentStreak, longestStreak: user.longestStreak, lastWorkoutDate: user.lastWorkoutDate, tier: user.subscriptionTier },
      recentWorkouts,
      weeklyWorkoutCount: weeklyWorkouts.length,
      weeklyVolume: weeklyWorkouts.reduce((acc, w) => acc + (w.totalVolume || 0), 0),
      weeklyMinutes: weeklyWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0),
      workoutsByMuscle,
      monthlyVolume,
      latestMetric,
      activeGoals,
      weeklyCalories,
    });
  } catch (err) { next(err); }
};

// ── GET /analytics/workout-frequency ───────────────────────
exports.getWorkoutFrequency = async (req, res, next) => {
  try {
    const { days = 90 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const frequency = await WorkoutLog.aggregate([
      { $match: { user: req.user._id, startTime: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }, count: { $sum: 1 }, volume: { $sum: '$totalVolume' } } },
      { $sort: { _id: 1 } },
    ]);

    return sendSuccess(res, 'Workout frequency fetched.', { frequency });
  } catch (err) { next(err); }
};

// ── ADMIN: GET /analytics/platform ─────────────────────────
exports.getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, verifiedUsers, totalWorkouts, totalNutritionLogs] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      WorkoutLog.countDocuments(),
      NutritionLog.countDocuments(),
    ]);

    const usersByTier = await User.aggregate([
      { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } }
    ]);

    const recentSignups = await User.find().sort({ createdAt: -1 }).limit(10).select('firstName lastName email createdAt subscriptionTier');

    return sendSuccess(res, 'Platform stats fetched.', { totalUsers, verifiedUsers, totalWorkouts, totalNutritionLogs, usersByTier, recentSignups });
  } catch (err) { next(err); }
};
