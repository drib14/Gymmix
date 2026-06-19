const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/support.controller');
const { generalLimiter } = require('../middleware/rateLimiter');

router.post('/contact', generalLimiter, ctrl.createInquiry);

module.exports = router;
