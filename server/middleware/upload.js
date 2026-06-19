const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Avatar storage
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gymmix/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    public_id: (req, file) => `avatar_${req.user._id}_${Date.now()}`,
  },
});

// Exercise image storage
const exerciseStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gymmix/exercises',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'fill' }],
    public_id: (req, file) => `exercise_${Date.now()}`,
  },
});

// Blog cover image storage
const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gymmix/blog',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
    public_id: (req, file) => `blog_${Date.now()}`,
  },
});

// Progress photo storage
const progressStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gymmix/progress',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 1000, crop: 'fill' }],
    public_id: (req, file) => `progress_${req.user._id}_${Date.now()}`,
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

const uploadAvatar = multer({ storage: avatarStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadExercise = multer({ storage: exerciseStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadBlog = multer({ storage: blogStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadProgress = multer({ storage: progressStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { uploadAvatar, uploadExercise, uploadBlog, uploadProgress };
