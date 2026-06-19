const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    coverImagePublicId: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String },
    category: { type: String, enum: ['workout', 'nutrition', 'mindset', 'recovery', 'equipment', 'news', 'faq'], default: 'workout' },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
    isFeatured: { type: Boolean, default: false },
    isFAQ: { type: Boolean, default: false },
    faqQuestion: { type: String, default: '' },
    views: { type: Number, default: 0 },
    readTimeMinutes: { type: Number, default: 5 },
    metaDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate slug from title
blogPostSchema.pre('validate', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  next();
});

blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ isFAQ: 1, status: 1 });
blogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('BlogPost', blogPostSchema);
