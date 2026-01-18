import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import generateOTP from '../utils/generateOTP.js';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({ name, email, password });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[forgotPassword] NEW REQUEST - Email: ${email}`);
    console.log(`${'='.repeat(60)}`);
    
    if (!email) {
      console.warn('[forgotPassword] ✗ Email is required');
      return res.status(400).json({ message: 'Email is required' });
    }
    
    console.log(`[forgotPassword] ✓ Email validation passed`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[forgotPassword] ✗ User not found: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`[forgotPassword] ✓ User found: ${user.name}`);
    
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    
    console.log(`[forgotPassword] ✓ OTP saved to database: ${otp}`);
    
    const html = `
      <h1>Password Reset OTP</h1>
      <p>Your OTP for password reset is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `;
    
    console.log(`[forgotPassword] ℹ Email content prepared, about to send...`);
    
    try {
      const emailResult = await sendEmail(email, 'Password Reset OTP', html);
      
      console.log(`[forgotPassword] ✓ Email sent successfully via sendEmail`);
      console.log(`[forgotPassword] Email Result:`, emailResult);
      
      res.json({ 
        message: 'OTP sent to your email',
        otpSent: true,
        debug: {
          userFound: true,
          otpGenerated: true,
          emailSent: true,
          messageId: emailResult?.messageId
        }
      });
    } catch (emailError) {
      console.error(`[forgotPassword] ✗ Email sending FAILED:`, emailError.message);
      console.error(`[forgotPassword] ✗ Full Email Error:`, emailError);
      
      // Return error to frontend instead of hiding it
      res.status(500).json({ 
        message: `Email service error: ${emailError.message}`,
        otpGenerated: true,
        emailSent: false,
        error: emailError.message,
        code: emailError.code
      });
    }
  } catch (error) {
    console.error(`[forgotPassword] ✗ CRITICAL ERROR:`, error.message);
    console.error(`[forgotPassword] ✗ Full Error:`, error);
    
    res.status(500).json({ 
      message: `Server error: ${error.message}`,
      error: error.message
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
