import bcryptjs from 'bcryptjs';
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { send } from 'express/lib/response.js';

/* UTILS */
// Generate a Verification Code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

/* CONTROLLERS */
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

    sendVerificationEmail(user, verificationToken);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        ...user._doc,
        password: null,
      }
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



export const login = async (req, res) => {
  res.send('Login route');
};

export const logout = async (req, res) => {
  res.send('Logout route');
};

