const Exercise = require('../models/Exercise');
const cloudinary = require('../config/cloudinary');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /exercises ─────────────────────────────────────────
exports.getExercises = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, muscle, equipment, difficulty, category, search, sortBy = 'name' } = req.query;

    const query = { isActive: true };
    if (muscle) query.muscleGroups = { $in: [muscle] };
    if (equipment) query.equipment = equipment;
    if (difficulty) query.difficultyLevel = difficulty;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const total = await Exercise.countDocuments(query);
    const exercises = await Exercise.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName username');

    return sendPaginated(res, 'Exercises fetched.', exercises, {
      page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) { next(err); }
};

// ── GET /exercises/:id ─────────────────────────────────────
exports.getExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOne({ _id: req.params.id, isActive: true })
      .populate('createdBy', 'firstName lastName username');
    if (!exercise) return sendError(res, 'Exercise not found.', 404);
    return sendSuccess(res, 'Exercise fetched.', { exercise });
  } catch (err) { next(err); }
};

// ── POST /exercises (admin) ────────────────────────────────
exports.createExercise = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.file) {
      data.image = req.file.path;
      data.imagePublicId = req.file.filename;
    }
    const exercise = await Exercise.create(data);
    return sendSuccess(res, 'Exercise created.', { exercise }, 201);
  } catch (err) { next(err); }
};

// ── PUT /exercises/:id (admin) ─────────────────────────────
exports.updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return sendError(res, 'Exercise not found.', 404);

    if (req.file) {
      if (exercise.imagePublicId) await cloudinary.uploader.destroy(exercise.imagePublicId).catch(() => {});
      req.body.image = req.file.path;
      req.body.imagePublicId = req.file.filename;
    }

    const updated = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return sendSuccess(res, 'Exercise updated.', { exercise: updated });
  } catch (err) { next(err); }
};

// ── DELETE /exercises/:id (admin) ──────────────────────────
exports.deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return sendError(res, 'Exercise not found.', 404);

    if (exercise.imagePublicId) await cloudinary.uploader.destroy(exercise.imagePublicId).catch(() => {});
    exercise.isActive = false;
    await exercise.save();

    return sendSuccess(res, 'Exercise deleted.');
  } catch (err) { next(err); }
};

// ── GET /exercises/filters/meta ────────────────────────────
exports.getFilterMeta = async (req, res, next) => {
  try {
    const muscleGroups = Exercise.schema.path('muscleGroups').caster.enumValues;
    const equipment = Exercise.schema.path('equipment').enumValues;
    const difficulty = Exercise.schema.path('difficultyLevel').enumValues;
    const categories = Exercise.schema.path('category').enumValues;
    return sendSuccess(res, 'Filter meta.', { muscleGroups, equipment, difficulty, categories });
  } catch (err) { next(err); }
};
