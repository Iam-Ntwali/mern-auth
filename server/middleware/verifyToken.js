import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;   // Get token from cookies
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized - no token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);   // Verify token

    if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized - invalid token' });

    req.userId = decoded.userId;   // Add userId to request object
    next();

  } catch (err) {
    console.log('Error verifying token:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }

};