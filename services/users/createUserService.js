import db from '../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator';

dotenv.config();

// Validation rules
export const validateUserRegistration = [
  check('firstName').notEmpty().withMessage('First name is required'),
  check('lastName').notEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Invalid email format'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('country_code').notEmpty().withMessage('Country code is required'),
  check('number').notEmpty().withMessage('Phone number is required'),
];

export const createUser = async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, password, country_code, number } = req.body;
    const sanitizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const emailCode = Math.floor(1000 + Math.random() * 9000);
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const checkUserQuery = 'SELECT id FROM users WHERE email = ? OR number = ?';
    db.query(checkUserQuery, [sanitizedEmail, number], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

      const insertUserQuery = `INSERT INTO users 
        (firstName, lastName, email, password, country_code, number, role, isEmailVerified, emailCode, expiresAt, createdBy, 
        updatedBy, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, 'User', 0, ?, ?, ?, ?, ?, ?)`;

      db.query(
        insertUserQuery,
        [firstName, lastName, sanitizedEmail, hashedPassword, country_code, number, emailCode, expiresAt, email, email, timestamp, timestamp],
        (err, result) => {
          if (err) return res.status(500).json({ message: 'Error creating user', error: err });

          const token = jwt.sign(
            { sub: number, email: sanitizedEmail },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
          );

          res.status(201).json({
            message: 'User created successfully',
            data: {
              id: result.insertId,
              firstName,
              lastName,
              email: sanitizedEmail,
              isEmailVerified: false,
              emailVerification: { emailCode, expiresAt },
              role: 'User',
              token,
              country_code,
              number,
              createdAt: timestamp,
              updatedBy: email,
            },
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
