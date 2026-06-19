const Review = require('../models/Review');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /reviews ────────────────────────────────────────────
exports.getReviews = async (req, res, next) => {
  try {
    const { category, targetId, page = 1, limit = 10 } = req.query;
    const query = { isApproved: true, isPublic: true };
    if (category) query.category = category;
    if (targetId) query.targetId = targetId;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName avatar username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return sendPaginated(res, 'Reviews fetched.', reviews, { page: parseInt(page), limit: parseInt(limit), total });
  } catch (err) { next(err); }
};

// ── POST /reviews ───────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const existing = await Review.findOne({ user: req.user._id, category: req.body.category, targetId: req.body.targetId });
    if (existing) return sendError(res, 'You\'ve already reviewed this.', 409);

    const review = await Review.create({ ...req.body, user: req.user._id });
    return sendSuccess(res, 'Review submitted for approval.', { review }, 201);
  } catch (err) { next(err); }
};

// ── PUT /reviews/:id ────────────────────────────────────────
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, isApproved: false },
      { new: true }
    );
    if (!review) return sendError(res, 'Review not found.', 404);
    return sendSuccess(res, 'Review updated.', { review });
  } catch (err) { next(err); }
};

// ── DELETE /reviews/:id ─────────────────────────────────────
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!review) return sendError(res, 'Review not found.', 404);
    return sendSuccess(res, 'Review deleted.');
  } catch (err) { next(err); }
};

// ── POST /reviews/:id/helpful ───────────────────────────────
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return sendError(res, 'Review not found.', 404);

    const alreadyVoted = review.helpfulVotes.includes(req.user._id);
    if (alreadyVoted) {
      review.helpfulVotes.pull(req.user._id);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulVotes.push(req.user._id);
      review.helpfulCount += 1;
    }
    await review.save();
    return sendSuccess(res, alreadyVoted ? 'Vote removed.' : 'Marked as helpful.', { helpfulCount: review.helpfulCount });
  } catch (err) { next(err); }
};

// ── ADMIN: PUT /reviews/:id/approve ────────────────────────
exports.approveReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!review) return sendError(res, 'Review not found.', 404);
    return sendSuccess(res, 'Review approved.', { review });
  } catch (err) { next(err); }
};
