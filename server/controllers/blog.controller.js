const BlogPost = require('../models/BlogPost');
const cloudinary = require('../config/cloudinary');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// ── GET /blog ───────────────────────────────────────────────
exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, tag, search, featured } = req.query;
    const query = { status: 'published' };
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$text = { $search: search };

    const total = await BlogPost.countDocuments(query);
    const posts = await BlogPost.find(query)
      .select('-content')
      .populate('author', 'firstName lastName avatar')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return sendPaginated(res, 'Blog posts fetched.', posts, { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ── GET /blog/faqs ──────────────────────────────────────────
exports.getFAQs = async (req, res, next) => {
  try {
    const faqs = await BlogPost.find({ status: 'published', isFAQ: true })
      .select('faqQuestion content category tags')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 'FAQs fetched.', { faqs });
  } catch (err) { next(err); }
};

// ── GET /blog/:slug ─────────────────────────────────────────
exports.getPost = async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'firstName lastName avatar bio');
    if (!post) return sendError(res, 'Post not found.', 404);
    await BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    return sendSuccess(res, 'Post fetched.', { post });
  } catch (err) { next(err); }
};

// ── ADMIN: GET /blog/admin/all ─────────────────────────────
exports.adminGetPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const total = await BlogPost.countDocuments(query);
    const posts = await BlogPost.find(query)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    return sendPaginated(res, 'All posts fetched.', posts, { page: parseInt(page), limit: parseInt(limit), total });
  } catch (err) { next(err); }
};

// ── ADMIN: POST /blog ───────────────────────────────────────
exports.createPost = async (req, res, next) => {
  try {
    const data = { ...req.body, author: req.user._id, authorName: `${req.user.firstName} ${req.user.lastName}` };
    if (data.status === 'published' && !data.publishedAt) data.publishedAt = new Date();
    if (req.file) {
      data.coverImage = req.file.path;
      data.coverImagePublicId = req.file.filename;
    }
    const post = await BlogPost.create(data);
    return sendSuccess(res, 'Blog post created.', { post }, 201);
  } catch (err) { next(err); }
};

// ── ADMIN: PUT /blog/:id ────────────────────────────────────
exports.updatePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return sendError(res, 'Post not found.', 404);

    if (req.file) {
      if (post.coverImagePublicId) await cloudinary.uploader.destroy(post.coverImagePublicId).catch(() => {});
      req.body.coverImage = req.file.path;
      req.body.coverImagePublicId = req.file.filename;
    }

    if (req.body.status === 'published' && post.status !== 'published') req.body.publishedAt = new Date();

    const updated = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return sendSuccess(res, 'Post updated.', { post: updated });
  } catch (err) { next(err); }
};

// ── ADMIN: DELETE /blog/:id ─────────────────────────────────
exports.deletePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return sendError(res, 'Post not found.', 404);
    if (post.coverImagePublicId) await cloudinary.uploader.destroy(post.coverImagePublicId).catch(() => {});
    await post.deleteOne();
    return sendSuccess(res, 'Post deleted.');
  } catch (err) { next(err); }
};
