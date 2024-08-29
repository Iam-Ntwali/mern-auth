import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { User } from "../models/user.model.js";
import { generateTokenToSetCookie } from "../utils/jwt.js";
import { sendResetRequestEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/email.js';

/* UTILS */
// Generate a Verification Code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

/* CONTROLLERS */
// Signup
export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error('Missing required fields');
    }

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = generateVerificationCode();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    // JWT
    generateTokenToSetCookie(res, user._id);

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        ...user._doc,
        password: undefined,
      }
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  const { verificationCode } = req.body;
  try {
    const userData = await User.findOne({
      verificationToken: verificationCode,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!userData) {
      return res.status(400).json({ success: false, message: 'Invalid code or expired verification code' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      user: {
        ...user._doc,
        password: undefined,
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not exist!' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid password!' });
    }
    // Generate new token
    generateTokenToSetCookie(res, user._id);

    // Update last login
    user.lastLogin = new Date();

    // Save user
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        ...user._doc,
        password: undefined,
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Logout
export const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// forget password request
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found!' });
    }

    // Generate new reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // Send email
    await sendResetRequestEmail(email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({ success: true, message: 'Reset password email sent successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const userData = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!userData) {
      return res.status(400).json({ success: false, message: 'Invalid token or expired token' });
    }

    // Update password
    const hashedPassword = await bcryptjs.hash(password, 10);
    userData.password = hashedPassword;
    userData.resetPasswordToken = undefined;
    userData.resetPasswordExpiresAt = undefined;

    await userData.save();

    await sendResetSuccessEmail(userData.email);

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) {

  }
}

// Check auth
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
