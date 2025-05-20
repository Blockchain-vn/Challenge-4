const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký
router.post('/register', authController.register);

// Xác thực OTP
router.post('/verify-otp', authController.verifyOTP);

// Gửi lại OTP
router.post('/resend-otp', authController.resendOTP);

// Đăng nhập
router.post('/login', authController.login);

module.exports = router;