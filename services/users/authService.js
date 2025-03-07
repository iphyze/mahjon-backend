import db from '../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { passwordResetTemplate, emailVerificationTemplate, passwordVerifyTemplate, sendEmailVerificationTemplate, passwordUpdateTemplate } from '../../utils/emailTemplates.js';
import axios from 'axios';

dotenv.config();


const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID;
const TERMII_API_URL = process.env.TERMII_API_URL;


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: process.env.NODE_ENV !== 'production',
});


const sendVerificationEmail = async (to, emailCode, expiresAt, firstName) => {
  const mailOptions = {
    // from: '"Mahjong Nigeria Clinic" <noreply@yourdomain.com>',
    // from: process.env.SMTP_USER || '"Your App Name" <noreply@yourdomain.com>',
    from: '"Mahjong Nigeria Clinic" <' + process.env.SMTP_USER + '>',
    to,
    subject: 'Welcome / Email Verification',
    html: emailVerificationTemplate(firstName, emailCode, expiresAt),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false;
  }
};



const resendVerificationEmailHandler = async (to, emailCode, expiresAt, firstName) => {
  const mailOptions = {
    // from: '"Mahjong Nigeria Clinic" <noreply@yourdomain.com>',
    // from: process.env.SMTP_USER || '"Your App Name" <noreply@yourdomain.com>',
    from: '"Mahjong Nigeria Clinic" <' + process.env.SMTP_USER + '>',
    to,
    subject: 'Verify Your Email Address',
    html: sendEmailVerificationTemplate(firstName, emailCode, expiresAt),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false;
  }
};



// Validation rules
export const validateUserRegistration = [
  check('firstName').notEmpty().withMessage('First name is required'),
  check('lastName').notEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Invalid email format'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('country_code').notEmpty().withMessage('Country code is required'),
  check('number').notEmpty().withMessage('Phone number is required'),
];


// Validation middleware for the email
export const validateForgotPassword = [
  check('email').notEmpty().withMessage('Email is required.').isEmail().withMessage('Please provide a valid email address.')
];


// Validation middleware for the email
export const validateEmail = [
  check('email').notEmpty().withMessage('Email is required.').isEmail().withMessage('Please provide a valid email address.')
];


// Validation middleware for currentPassword and newPassword
export const validateUpdatePassword = [
  check('currentPassword').notEmpty().withMessage('Current password is required.'),
  check('newPassword').notEmpty().withMessage('New password is required.').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.')
];



const sendVerificationSMS = async (to, emailCode) => {
  try {
    const response = await axios.post(TERMII_API_URL, {
      api_key: TERMII_API_KEY,
      to: to,
      from: TERMII_SENDER_ID,
      sms: `Your Mahjong Nigeria email verification code is: ${emailCode}. Valid for 2 hours.`,
      type: 'plain',
      channel: 'generic'
    });

    console.log(`Verification SMS sent to ${to}`);
    return response.data.status === 'success';
  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error);
    return false;
  }
};



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
    const role = 'User';
    const membershipPayment = 'Pending';
    const membershipPaymentAmount = Number(0.00).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const membershipPaymentDate = '';
    const membershipPaymentDuration = '';
    const tutorshipPayment = 'Pending';
    const tutorshipPaymentAmount = Number(0.00).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const tutorshipPaymentDate = '';
    const tutorshipPaymentDuration = '';
    const isEmailVerified = 0;

    const [baseName, domain] = sanitizedEmail.split('@');
    const domainInitial = domain[0].toLowerCase(); // First letter of the domain
    const userName = `${baseName}-${domainInitial}-${Math.floor(1000 + Math.random() * 9000)}`;


    const checkUserQuery = 'SELECT id FROM users WHERE email = ? OR number = ?';
    db.query(checkUserQuery, [sanitizedEmail, number], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

      const insertUserQuery = `INSERT INTO users 
        (firstName, lastName, email, userName, password, country_code, number, role, isEmailVerified, emailCode, expiresAt, createdBy, 
        updatedBy, createdAt, updatedAt, membershipPayment, tutorshipPayment) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(
          insertUserQuery,
          [firstName, lastName, sanitizedEmail, userName, hashedPassword, country_code, number, role, isEmailVerified, emailCode, expiresAt, email, email, 
            timestamp, timestamp, membershipPayment, tutorshipPayment],
          async (err, result) => {
            if (err) return res.status(500).json({ message: 'Error creating user', error: err });
  
            const emailSent = await sendVerificationEmail(sanitizedEmail, emailCode, expiresAt, firstName);
            const smsSent = await sendVerificationSMS(country_code + number, emailCode);

            const token = jwt.sign(
              { sub: number, email: sanitizedEmail },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
            );
  
            res.status(200).json({
              message: emailSent && smsSent
                ? 'User registration was successful. Kindly verify your email!'
                : 'User registration was successful, however we were not able to verify your email!.',
              data: {
                id: result.insertId,
                firstName,
                lastName,
                email: sanitizedEmail,
                userName: userName,
                isEmailVerified: false,
                emailVerification: { emailCode, expiresAt },
                payments: 
                  {
                    membership: {
                      membershipPayment,
                      membershipPaymentAmount,
                      membershipPaymentDate,
                      membershipPaymentDuration,
                    },
                    tutorship: {
                      tutorshipPayment,
                      tutorshipPaymentAmount,
                      tutorshipPaymentDate,
                      tutorshipPaymentDuration,
                    }
                  },
                role: 'User',
                token,
                country_code,
                number,
                createdAt: timestamp,
                updatedBy: email,
              },
              verificationStatus: {
                email: emailSent,
                sms: smsSent
              }
            });
          }
        );
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
};


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
          userName: user.userName,
          isEmailVerified: user.isEmailVerified === 1,
          payments: 
                  {
                    membership: {
                      membershipPayment: user?.membershipPayment,
                      membershipPaymentAmount: user?.membershipPaymentAmount,
                      membershipPaymentDate: user?.membershipPaymentDate,
                      membershipPaymentDuration: user?.membershipPaymentDuration,
                    },
                    tutorship: {
                      tutorshipPayment: user?.tutorshipPayment,
                      tutorshipPaymentAmount: user?.tutorshipPaymentAmount,
                      tutorshipPaymentDate: user?.tutorshipPaymentDate,
                      tutorshipPaymentDuration: user?.tutorshipPaymentDuration,
                    }
          },
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
  


  // export const resendVerificationEmail = (req, res) => {

  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(400).json({ errors: errors.array() });
  //   }

  //   const { email } = req.body;
  
  //   // Check if email is provided
  //   if (!email) {
  //     return res.status(400).json({ message: 'Email is required.' });
  //   }
  
  //   // Check if email exists and is not verified
  //   const findUserQuery = `SELECT * FROM users WHERE email = ?`;
  //   db.query(findUserQuery, [email], (err, results) => {
  //     if (err) {
  //       return res.status(500).json({ message: 'Database error', error: err });
  //     }
  
  //     if (results.length === 0) {
  //       return res.status(404).json({ message: 'The provided email does not exist. Please create an account first.' });
  //     }
  
  //     const user = results[0];
  //     if (user.isEmailVerified == 1 || user.isEmailVerified == true) {
  //       return res.status(400).json({ message: 'Your email is already verified.' });
  //     }
  
  //     const emailCode = Math.floor(1000 + Math.random() * 9000);
  //     const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  
  //     // Update the database with the new email code and expiration date
  //     const updateUserQuery = `UPDATE users SET emailCode = ?, expiresAt = ? WHERE email = ?`;
  //     db.query(updateUserQuery, [emailCode, expiresAt, email], (err) => {
  //       if (err) {
  //         return res.status(500).json({ message: 'Database error', error: err });
  //       }
  
  //       // Send the verification email
  //       const mailOptions = {
  //         from: process.env.EMAIL_USER,
  //         to: email,
  //         subject: 'Email Verification Code',
  //         text: `Your verification code is ${emailCode}. It will expire in 2hrs minutes.`,
  //       };
  
  //       transporter.sendMail(mailOptions, (err) => {
  //         if (err) {
  //           return res.status(500).json({ message: 'Failed to send email', error: err });
  //         }
  
  //         res.status(200).json({
  //           message: 'Verification code sent successfully. Please check your email.',
  //           emailCode,
  //           expiresAt,
  //         });
  //       });
  //     });
  //   });
  // };

  export const resendVerificationEmail = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email } = req.body;
    
    // Check if email exists and is not verified
    const findUserQuery = `SELECT * FROM users WHERE email = ?`;
    db.query(findUserQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
    
      if (results.length === 0) {
        return res.status(404).json({ message: 'The provided email does not exist. Please create an account first.' });
      }
    
      const user = results[0];
      // Fix the condition - should check if email is ALREADY verified
      if (user.isEmailVerified === 1 || user.isEmailVerified === true) {
        return res.status(400).json({ message: 'Your email is already verified.' });
      }
    
      const emailCode = Math.floor(1000 + Math.random() * 9000);
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    
      // Update the database with the new email code and expiration date
      const updateUserQuery = `UPDATE users SET emailCode = ?, expiresAt = ? WHERE email = ?`;
      db.query(updateUserQuery, [emailCode, expiresAt, email], async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }
    
        // Use the sendVerificationEmail function instead of duplicating code
        const emailSent = await resendVerificationEmailHandler(email, emailCode, expiresAt, user.firstName);
        
        if (emailSent) {
          res.status(200).json({
            message: 'Verification code sent successfully. Please check your email.',
            emailCode,
            expiresAt,
          });
        } else {
          res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
        }
      });
    });
  };


  export const verifyEmail = (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, emailCode } = req.body;
  
    // Check if both email and emailCode are provided
    if (!email || !emailCode) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }
  
    // Query to find the user by email
    const findUserQuery = `SELECT * FROM users WHERE email = ?`;
    db.query(findUserQuery, [email], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'The provided email does not exist.' });
      }
  
      const user = results[0];
  
      // Check if the email is already verified
      if (user.isEmailVerified) {
        return res.status(400).json({ message: 'This email is already verified.' });
      }
  
      // Check if the provided emailCode matches and is not expired
      if (user.emailCode !== parseInt(emailCode, 10) || new Date(user.expiresAt) < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired verification code.' });
      }
  
      // Update the user's email verification status
      const updateUserQuery = `UPDATE users SET isEmailVerified = 1, emailCode = NULL, expiresAt = NULL WHERE email = ?`;
      db.query(updateUserQuery, [email], async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }
  
        // Send confirmation email
        const mailOptions = {
          // from: process.env.SMTP_USER || '"Your App Name" <noreply@yourdomain.com>',
          from: '"Mahjong Nigeria Clinic" <' + process.env.SMTP_USER + '>',
          to: email,
          subject: 'Email Verified Successfully',
          html: passwordVerifyTemplate(user.firstName)
        };
  
        try {
          await transporter.sendMail(mailOptions);
          console.log(`Confirmation email sent to ${email}`);
        } catch (emailError) {
          console.error(`Error sending confirmation email to ${email}:`, emailError);
        }
  
        // Send success response
        res.status(200).json({ message: 'Email verified successfully!' });
      });
    });
  };
  

  // Forgot Password Function
export const forgotPassword = async (req, res) => {
  // Validate the email field
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  // Query to find the user by email
  const findUserQuery = `SELECT * FROM users WHERE email = ?`;
  db.query(findUserQuery, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'The provided email does not exist in our system.' });
    }

    const user = results[0];

    // Generate a new random password
    const newPassword = `${crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 7)}!1`; // Ensures a 16-character password with a special char (!) and a number (1)

    // Hash the new password
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing the password.', error: err });
      }

      // Update the user's password in the database
      const updatePasswordQuery = `UPDATE users SET password = ? WHERE email = ?`;
      db.query(updatePasswordQuery, [hashedPassword, email], async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Database error while updating password.', error: err });
        }

        // Send the new password to the user's email
        const mailOptions = {
          from: process.env.SMTP_USER || '"Your App Name" <noreply@yourdomain.com>',
          to: email,
          subject: 'Your Password Has Been Reset',
          html: passwordResetTemplate(user.firstName, newPassword)
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`New password sent to ${email}`);
        } catch (emailError) {
          console.error(`Error sending new password email to ${email}:`, emailError);
        }

        // Send success response
        res.status(200).json({ message: 'A new password has been sent to your email address.' });
      });
    });
  });
};


// Update Password Function
export const updatePassword = async (req, res) => {
  // Validate the fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params; // Assuming the user's ID is passed in the URL
  const { currentPassword, newPassword } = req.body;

  // Query to get the user by ID
  const findUserQuery = `SELECT * FROM users WHERE id = ?`;
  db.query(findUserQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = results[0];

    // Compare the currentPassword with the stored hashed password
    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Error comparing passwords.', error: err });
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }

      // Hash the new password
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ message: 'Error hashing the new password.', error: err });
        }

        // Update the password in the database
        const updatePasswordQuery = `UPDATE users SET password = ? WHERE id = ?`;
        db.query(updatePasswordQuery, [hashedPassword, id], async (err) => {
          if (err) {
            return res.status(500).json({ message: 'Database error while updating password.', error: err });
          }

          // Send email notification
          const mailOptions = {
            from: '"Mahjong Nigeria Clinic" <' + process.env.SMTP_USER + '>',
            to: user.email,
            subject: 'Password Update',
            html: passwordUpdateTemplate(user.firstName)
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Password update notification sent to ${user.email}`);
          } catch (emailError) {
            console.error(`Error sending password update email to ${user.email}:`, emailError);
          }

          // Send success response
          res.status(200).json({ message: 'Password updated successfully. A notification has been sent to your email.' });
        });
      });
    });
  });
};