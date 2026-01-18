import express from 'express';
import {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getProfile
} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);

export default router;
