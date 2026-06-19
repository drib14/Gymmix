const WorkoutLog = require('../models/WorkoutLog');
const WorkoutPlan = require('../models/WorkoutPlan');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const { createNotification } = require('./notification.controller');

// ── GET /workout-logs ──────────────────────────────────────
exports.getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, from, to, muscle, planId } = req.query;
    const query = { user: req.user._id };
    if (from || to) {
      query.startTime = {};
      if (from) query.startTime.$gte = new Date(from);
      if (to) query.startTime.$lte = new Date(to);
    }
    if (muscle) query.musclesWorked = { $in: [muscle] };
    if (planId) query.workoutPlan = planId;

    const total = await WorkoutLog.countDocuments(query);
    const logs = await WorkoutLog.find(query)
      .populate('exercises.exercise', 'name image muscleGroups')
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return sendPaginated(res, 'Workout logs fetched.', logs, {
      page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
};

// ── GET /workout-logs/:id ──────────────────────────────────
exports.getLog = async (req, res, next) => {
  try {
    const log = await WorkoutLog.findOne({ _id: req.params.id, user: req.user._id })
      .populate('exercises.exercise', 'name image muscleGroups equipment');
    if (!log) return sendError(res, 'Workout log not found.', 404);
    return sendSuccess(res, 'Workout log fetched.', { log });
  } catch (err) { next(err); }
};

// ── POST /workout-logs ─────────────────────────────────────
exports.createLog = async (req, res, next) => {
  try {
    const { workoutPlanId, dayName, exercises, startTime, endTime, notes, rating, mood } = req.body;

    // Compute derived fields
    let totalVolume = 0;
    let totalSets = 0;
    const musclesSet = new Set();
    const exercisesData = [];

    for (const ex of exercises) {
      const exDoc = await Exercise.findById(ex.exercise);
      if (exDoc) {
        exDoc.muscleGroups.forEach((m) => musclesSet.add(m));
        await Exercise.findByIdAndUpdate(ex.exercise, { $inc: { timesUsed: 1 } });
        exercisesData.push({ ...ex, exerciseName: exDoc.name });
      } else {
        exercisesData.push(ex);
      }
      const exVol = (ex.sets || []).reduce((acc, s) => acc + ((s.reps || 0) * (s.weight || 0)), 0);
      totalVolume += exVol;
      totalSets += (ex.sets || []).length;
    }

    const startDate = new Date(startTime);
    const endDate = endTime ? new Date(endTime) : new Date();
    const durationMinutes = Math.round((endDate - startDate) / 60000);

    const log = await WorkoutLog.create({
      user: req.user._id,
      workoutPlan: workoutPlanId,
      workoutPlanName: workoutPlanId ? (await WorkoutPlan.findById(workoutPlanId))?.name : undefined,
      dayName,
      exercises: exercisesData,
      startTime: startDate,
      endTime: endDate,
      durationMinutes,
      totalVolume,
      totalSets,
      notes,
      rating,
      mood,
      musclesWorked: [...musclesSet],
    });

    // Update workout plan stats
    if (workoutPlanId) {
      await WorkoutPlan.findByIdAndUpdate(workoutPlanId, { $inc: { timesCompleted: 1 } });
    }

    // Update user workout stats + streak
    const user = await User.findById(req.user._id);
    user.totalWorkouts += 1;
    const lastDate = user.lastWorkoutDate ? new Date(user.lastWorkoutDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (lastDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate >= yesterday) {
        user.currentStreak += 1;
      } else {
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }
    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
    user.lastWorkoutDate = new Date();
    await user.save();

    // Streak notifications
    if ([7, 14, 30, 60, 100].includes(user.currentStreak)) {
      await createNotification({
        recipient: user._id,
        type: 'workout_streak',
        title: `🔥 ${user.currentStreak}-Day Streak!`,
        message: `Amazing! You've worked out ${user.currentStreak} days in a row. Keep it up!`,
      });
    }

    return sendSuccess(res, 'Workout logged successfully!', { log }, 201);
  } catch (err) { next(err); }
};

// ── PUT /workout-logs/:id ──────────────────────────────────
exports.updateLog = async (req, res, next) => {
  try {
    const log = await WorkoutLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!log) return sendError(res, 'Log not found or unauthorized.', 404);
    return sendSuccess(res, 'Log updated.', { log });
  } catch (err) { next(err); }
};

// ── DELETE /workout-logs/:id ───────────────────────────────
exports.deleteLog = async (req, res, next) => {
  try {
    const log = await WorkoutLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) return sendError(res, 'Log not found or unauthorized.', 404);
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalWorkouts: -1 } });
    return sendSuccess(res, 'Log deleted.');
  } catch (err) { next(err); }
};

// ── GET /workout-logs/stats/summary ───────────────────────
exports.getStatsSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [totalWorkouts, totalVolume, totalTime] = await Promise.all([
      WorkoutLog.countDocuments({ user: userId }),
      WorkoutLog.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$totalVolume' } } }]),
      WorkoutLog.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$durationMinutes' } } }]),
    ]);
    return sendSuccess(res, 'Stats fetched.', {
      totalWorkouts,
      totalVolume: totalVolume[0]?.total || 0,
      totalMinutes: totalTime[0]?.total || 0,
    });
  } catch (err) { next(err); }
};
