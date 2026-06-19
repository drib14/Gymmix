const WorkoutPlan = require('../models/WorkoutPlan');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /workout-plans ─────────────────────────────────────
exports.getPlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, goal, difficulty, search } = req.query;
    const query = { owner: req.user._id, isActive: true };
    if (goal) query.goal = goal;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.name = new RegExp(search, 'i');

    const total = await WorkoutPlan.countDocuments(query);
    const plans = await WorkoutPlan.find(query)
      .populate('days.exercises.exercise', 'name muscleGroups equipment image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return sendPaginated(res, 'Workout plans fetched.', plans, {
      page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
};

// ── GET /workout-plans/public ──────────────────────────────
exports.getPublicPlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, goal, difficulty } = req.query;
    const query = { isPublic: true, isActive: true };
    if (goal) query.goal = goal;
    if (difficulty) query.difficulty = difficulty;

    const total = await WorkoutPlan.countDocuments(query);
    const plans = await WorkoutPlan.find(query)
      .populate('owner', 'firstName lastName username avatar')
      .sort({ timesCompleted: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return sendPaginated(res, 'Public plans fetched.', plans, {
      page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
};

// ── GET /workout-plans/:id ─────────────────────────────────
exports.getPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { isPublic: true }],
    }).populate('days.exercises.exercise');

    if (!plan) return sendError(res, 'Workout plan not found.', 404);
    return sendSuccess(res, 'Workout plan fetched.', { plan });
  } catch (err) { next(err); }
};

// ── POST /workout-plans ────────────────────────────────────
exports.createPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.create({ ...req.body, owner: req.user._id });
    return sendSuccess(res, 'Workout plan created.', { plan }, 201);
  } catch (err) { next(err); }
};

// ── PUT /workout-plans/:id ─────────────────────────────────
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) return sendError(res, 'Workout plan not found or unauthorized.', 404);
    return sendSuccess(res, 'Workout plan updated.', { plan });
  } catch (err) { next(err); }
};

// ── DELETE /workout-plans/:id ──────────────────────────────
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!plan) return sendError(res, 'Workout plan not found or unauthorized.', 404);
    return sendSuccess(res, 'Workout plan deleted.');
  } catch (err) { next(err); }
};

// ── POST /workout-plans/:id/clone ──────────────────────────
exports.clonePlan = async (req, res, next) => {
  try {
    const original = await WorkoutPlan.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { isPublic: true }],
    });
    if (!original) return sendError(res, 'Workout plan not found.', 404);

    const clone = original.toObject();
    delete clone._id;
    clone.owner = req.user._id;
    clone.name = `${original.name} (Copy)`;
    clone.isPublic = false;
    clone.timesCompleted = 0;
    clone.createdAt = undefined;
    clone.updatedAt = undefined;

    const newPlan = await WorkoutPlan.create(clone);
    return sendSuccess(res, 'Workout plan cloned.', { plan: newPlan }, 201);
  } catch (err) { next(err); }
};
