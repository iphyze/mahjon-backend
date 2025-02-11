import db from '../../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        {
          sub: user.number, // Same as registerUser
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      return res.json({
        message: 'Login successful',
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isEmailVerified: user.isEmailVerified === 1,
          emailVerification: { emailCode: user.emailCode, expiresAt: user.expiresAt },
          role: user.role || 'User',
          token,
          country_code: user.country_code,
          number: user.number,
          createdAt: user.createdAt,
          updatedBy: user.updatedBy,
        },
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
