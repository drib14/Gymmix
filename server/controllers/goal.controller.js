const Goal = require('../models/Goal');
const { createNotification } = require('./notification.controller');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /goals ─────────────────────────────────────────────
exports.getGoals = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;
    const goals = await Goal.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, 'Goals fetched.', { goals });
  } catch (err) { next(err); }
};

// ── GET /goals/:id ─────────────────────────────────────────
exports.getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return sendError(res, 'Goal not found.', 404);
    return sendSuccess(res, 'Goal fetched.', { goal });
  } catch (err) { next(err); }
};

// ── POST /goals ────────────────────────────────────────────
exports.createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create({ ...req.body, user: req.user._id });
    return sendSuccess(res, 'Goal created!', { goal }, 201);
  } catch (err) { next(err); }
};

// ── PUT /goals/:id ─────────────────────────────────────────
exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return sendError(res, 'Goal not found.', 404);

    Object.assign(goal, req.body);
    const wasCompleted = goal.status === 'completed';
    goal.updateProgress();
    await goal.save();

    // Notify on achievement
    if (goal.status === 'completed' && !wasCompleted) {
      await createNotification({
        recipient: req.user._id,
        type: 'goal_achieved',
        title: '🏆 Goal Achieved!',
        message: `Congratulations! You've achieved your goal: "${goal.title}"`,
        link: '/goals',
      });
    }

    return sendSuccess(res, 'Goal updated.', { goal });
  } catch (err) { next(err); }
};

// ── DELETE /goals/:id ──────────────────────────────────────
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return sendError(res, 'Goal not found.', 404);
    return sendSuccess(res, 'Goal deleted.');
  } catch (err) { next(err); }
};
