import bcryptjs from 'bcryptjs';
import { User } from "../models/user.model.js";
import { generateTokenToSetCookie } from "../utils/jwt.js";
import { sendVerificationEmail } from '../mailtrap/email.js';

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
      verificationTokenExpiresAt: Date.now() + 180000, // 3 minutes
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
    const user = await User.findOne({
      verificationToken: verificationCode,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

  } catch (err) {

  }
}

// Login
export const login = async (req, res) => {
  res.send('Login route');
};

export const logout = async (req, res) => {
  res.send('Logout route');
};

