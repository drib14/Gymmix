const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blog.controller');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadBlog } = require('../middleware/upload');

// Public
router.get('/faqs', ctrl.getFAQs);
router.get('/', ctrl.getPosts);
router.get('/:slug', ctrl.getPost);

// Admin
router.use(protect);
router.get('/admin/all', adminOnly, ctrl.adminGetPosts);
router.post('/', adminOnly, uploadBlog.single('coverImage'), ctrl.createPost);
router.put('/:id', adminOnly, uploadBlog.single('coverImage'), ctrl.updatePost);
router.delete('/:id', adminOnly, ctrl.deletePost);

module.exports = router;
