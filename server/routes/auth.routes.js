const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((v, { req }) => { if (v !== req.body.password) throw new Error('Passwords do not match'); return true; }),
  body('acceptedTerms').equals('true').withMessage('You must accept the Terms of Service'),
  body('acceptedPrivacy').equals('true').withMessage('You must accept the Privacy Policy'),
];

router.post('/register', authLimiter, registerRules, validate, ctrl.register);
router.post('/verify-otp', authLimiter, ctrl.verifyOTP);
router.post('/resend-otp', authLimiter, ctrl.resendOTP);
router.post('/login', authLimiter, [body('email').isEmail(), body('password').notEmpty()], validate, ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', ctrl.logout);
router.post('/forgot-password', authLimiter, [body('email').isEmail()], validate, ctrl.forgotPassword);
router.post('/reset-password', authLimiter, [body('newPassword').isLength({ min: 6 })], validate, ctrl.resetPassword);

module.exports = router;
