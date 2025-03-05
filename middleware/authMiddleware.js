import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded; // Add the decoded user to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Session expired please login again!' });
  }
};
